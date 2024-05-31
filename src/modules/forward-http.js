import config from '../config.js'

var $ctx
var $resource
var $target

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .pipe(
    () => selectTarget() ? 'forward' : 'bypass',
    {
      'forward': ($=>$
        .muxHTTP(() => $resource).to($=>$
          .pipe(() => $target.connect) // TODO: Passive health check
        )
        .onEnd(() => $resource.free())
      ),
      'bypass': $=>$.pipeNext(),
    }
  )
)

function selectTarget() {
  var lb = loadBalancers.get($ctx.serviceConfig.Endpoints)
  $resource = lb.allocate(null, target => !unhealthyCache.has(target.address))
  if ($resource) {
    $target = $resource.target
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
