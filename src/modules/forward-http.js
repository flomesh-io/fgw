import config from '../config.js'

var $ctx
var $resource
var $target
var $stickyCookie
var $stickyAddress

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .handleMessageStart(handleStickyCookie)
  .pipe(
    () => selectTarget() ? 'forward' : 'bypass',
    {
      'forward': ($=>$
        .muxHTTP(() => $resource).to($=>$
          .pipe(() => $target.connect) // TODO: Passive health check
        )
        .handleMessageStart(insertStickyCookie)
        .onEnd(() => $resource.free())
      ),
      'bypass': $=>$.pipeNext(),
    }
  )
)

// TODO: Make the cache shared across threads
// TODO: Handle cache TTL
var stickyCookieCache = new algo.Cache()

function handleStickyCookie(msg) {
  var serviceConfig = $ctx.serviceConfig
  var name = serviceConfig.StickyCookieName
  if (!name) return

  var prefix = name + '='
  var cookie
  var cookies = msg.head.headers.cookie
  if (cookies) {
    cookie = cookies.split(';').find(c => c.trim().startsWith(prefix))
    if (cookie) cookie = cookie.substring(prefix.length).trim()
  }

  if (cookie) {
    $stickyCookie = cookie
    $stickyAddress = stickyCookieCache.get(cookie)
    if ($stickyAddress) return
  }

  $stickyCookie = algo.uuid()
}

function insertStickyCookie(msg) {
  if ($stickyCookie) {
    var serviceConfig = $ctx.serviceConfig
    var name = serviceConfig.StickyCookieName
    var expires = serviceConfig.StickyCookieExpires
    var cookie = `${name}=${$stickyCookie}; max-age=${expires}`
    var headers = msg.head.headers
    var cookies = headers['set-cookie']
    if (cookies) {
      if (typeof cookies === 'string') {
        headers['set-cookie'] = [cookies, cookie]
      } else {
        headers.push(cookie)
      }
    } else {
      headers['set-cookie'] = cookie
    }
  }
}

function selectTarget() {
  var lb = loadBalancers.get($ctx.serviceConfig.Endpoints)
  $resource = lb.allocate($stickyAddress, target => !unhealthyCache.has(target.address))
  if ($resource) {
    $target = $resource.target
    if ($stickyCookie) stickyCookieCache.set($stickyCookie, $target.address)
    return true
  } else {
    return false
  }
}

var loadBalancers = new algo.Cache(
  endpoints => new algo.LoadBalancer(
    Object.entries(endpoints).map(
      ([k, v]) => {
        var connect
        if ($ctx.serviceConfig.MTLS) {
          connect = pipeline($=>$
            .connectTLS({
              certificate: {
                cert: new crypto.CertificateChain(v.UpstreamCert.CertChain),
                key: new crypto.PrivateKey(v.UpstreamCert.PrivateKey),
              },
              trusted: [new crypto.Certificate(v.UpstreamCert.IssuingCA)],
            }).to($=>$
              .connect(() => $target.address)
            )
          )
        } else {
          connect = v.UseSSL ? connectTLS : connectTCP
        }
        return {
          address: k,
          weight: v.Weight,
          tags: v.Tags,
          connect,
        }
      }
    ), {
      key: t => t.address,
      weight: t => t.weight,
    }
  )
)

var connectTCP = pipeline($=>$
  .connect(() => $target.address)
)

var connectTLS = pipeline($=>$
  .connectTLS({}).to($=>$
    .connect(() => $target.address)
  )
)

// TODO: Use a shared-across-threads Cache
var unhealthyCache = new algo.Cache

if (pipy.thread.id === 0) {
  var hcTargets = []

  Object.values(config.Services).forEach(
    function (svc) {
      var hc = svc.HealthCheck
      var targets = svc.Endpoints
      if (!hc || !targets) return

      Object.keys(targets).forEach(
        address => {
          var isHealthy = true
          var failCount = 0
          var failTime = 0
          var lastCheckTime = Date.now() / 1000

          var checkers = hc.Matches.map(
            m => {
              if (m.StatusCodes) return res => m.StatusCodes.includes(res.head.status)
              if (m.Body) return res => res.body?.toString?.() === m.Body
              if (m.Headers) {
                var headers = Object.entries(m.Headers).map(([k, v]) => [k.toLowerCase(), v])
                return res => {
                  var h = res.head.headers
                  return !headers.some(([k, v]) => h[k] !== v)
                }
              }
              return () => true
            }
          )

          var hcPipeline = pipeline($=>$
            .onStart(new Message({ path: hc.Path }))
            .encodeHTTPRequest()
            .connect(address, { connectTimeout: 5, idleTimeout: 5 })
            .decodeHTTPResponse()
            .handleMessage(
              function (res, i) {
                if (i > 0) return
                if (checkers.some(f => !f(res))) {
                  fail()
                } else {
                  reset()
                }
              }
            )
          )

          function reset() {
            isHealthy = true
            failCount = 0
            failTime = 0
            unhealthyCache.remove(address, true)
          }

          function fail() {
            failCount++
            failTime = Date.now() / 1000
            if (failCount >= hc.MaxFails) {
              isHealthy = false
              unhealthyCache.set(address, true)
            }
          }

          function check(t) {
            if (hc.Interval) {
              if (t - lastCheckTime >= hc.Interval) {
                lastCheckTime = t
                return hcPipeline.spawn()
              }
            } else if (!isHealthy) {
              if (t - failTime >= hc.FailTimeout) {
                reset()
              }
            }
            return Promise.resolve()
          }

          hcTargets.push({
            address,
            isHealthy: () => isHealthy,
            reset, fail, check,
          })
        }
      )
    }
  )

  function healthCheckAll() {
    Promise.all(hcTargets.map(
      target => target.check(Date.now() / 1000)
    )).then(
      () => new Timeout(1).wait()
    ).then(healthCheckAll)
  }

  healthCheckAll()
}
