export default function (healthCheck, targets) {
  var allTargets = []
  var unhealthyCache = new algo.Cache

  if (pipy.thread.id === 0) {
    Object.keys(targets).forEach(
      address => {
        var isHealthy = true
        var failCount = 0
        var failTime = 0
        var lastCheckTime = Date.now() / 1000

        var checkers = healthCheck.Matches.map(
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
          .onStart(new Message({ path: healthCheck.Path }))
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
          if (failCount >= healthCheck.MaxFails) {
            isHealthy = false
            unhealthyCache.set(address, true)
          }
        }

        function check(t) {
          if (healthCheck.Interval) {
            if (t - lastCheckTime >= healthCheck.Interval) {
              lastCheckTime = t
              return hcPipeline.spawn()
            }
          } else if (!isHealthy) {
            if (t - failTime >= healthCheck.FailTimeout) {
              reset()
            }
          }
          return Promise.resolve()
        }

        allTargets.push({
          address,
          isHealthy: () => isHealthy,
          reset, fail, check,
        })
      }
    )
  
    function healthCheckAll() {
      Promise.all(allTargets.map(
        target => target.check(Date.now() / 1000)
      )).then(
        () => new Timeout(1).wait()
      ).then(healthCheckAll)
    }
  
    healthCheckAll()
  }

  function isHealthy(target) {
    return !unhealthyCache.has(target)
  }

  return { isHealthy }
}
