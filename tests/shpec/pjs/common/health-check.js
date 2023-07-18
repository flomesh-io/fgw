/*
 * MIT License
 *
 * Copyright (c) since 2021,  flomesh.io Authors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

((
  { config, isDebugEnabled } = pipy.solve('config.js'),

  healthCheckTargets = {},

  healthCheckServices = {},

  makeHealthCheck = (serviceConfig) => (
    serviceConfig?.HealthCheck && (
      (
        name = serviceConfig.name,
        interval = serviceConfig.HealthCheck?.Interval, // || 15, active
        maxFails = serviceConfig.HealthCheck?.MaxFails, // || 3, both
        failTimeout = serviceConfig.HealthCheck?.FailTimeout, // || 300, passivity
        uri = serviceConfig.HealthCheck?.Uri, // for HTTP
        matches = serviceConfig.HealthCheck?.Matches || [{ Type: "status", Value: "200" }], // for HTTP
      ) => (
        {
          name,
          interval,
          maxFails,
          failTimeout,
          uri,
          matches,

          toString: () => (
            'service: ' + name + ', interval: ' + interval + ', maxFails: ' + maxFails + ', uri: ' + uri + ', matches: ' + matches
          ),

          ok: target => (
            (target.alive === 0) && (
              target.alive = 1,
              target.errorCount = 0,
              healthCheckServices[name] && healthCheckServices[name].get(target.target) && (
                healthCheckServices[name].remove(target.target)
              ),
              isDebugEnabled && (
                console.log('[health-check] ok - service, target:', name, target.target)
              )
            )
          ),

          fail: target => (
            (++target.errorCount >= maxFails && target.alive) && (
              target.alive = 0,
              target.failTick = 0,
              !healthCheckServices[name] ? (
                healthCheckServices[name] = new algo.Cache(),
                healthCheckServices[name].set(target.target, true)
              ) : (
                !healthCheckServices[name].get(target.target) && (
                  healthCheckServices[name].set(target.target, true)
                )
              ),
              isDebugEnabled && (
                console.log('[health-check] fail - service, target:', name, target.target)
              )
            )
          ),

          available: target => (
            target.alive > 0
          ),

          match: msg => (
            (
              match_rules = matches.map(
                m => (
                  (m?.Type === 'status') ? (
                    msg => (
                      msg?.head?.status == m?.Value
                    )
                  ) : (
                    (m?.Type === 'body') ? (
                      msg => (
                        msg?.body?.toString?.()?.includes(m?.Value)
                      )
                    ) : (
                      (m?.Type === 'headers') ? (
                        msg => (
                          msg?.head?.headers?.[m?.Name?.toLowerCase?.()] === m?.Value
                        )
                      ) : (
                        () => false
                      )
                    )
                  )
                )
              ),
            ) => (
              match_rules.every(m => m(msg))
            )
          )(),

          check: target => (
            (
              agent = new http.Agent(target.target),
              promise = agent.request('GET', uri),
            ) => (
              promise.then(
                result => (
                  target.service.match(result) ? (
                    target.service.ok(target)
                  ) : (
                    target.service.fail(target)
                  ),
                  {}
                )
              )
            )
          )(),
        }
      )
    )()
  ),

  healthCheckCache = new algo.Cache(makeHealthCheck),

) => pipy({
  _service: null,
})

.export('health-check', {
  __healthCheckTargets: healthCheckTargets,
  __healthCheckServices: healthCheckServices,
})

.pipeline()
.onStart(
  () => void (
    Object.keys(config?.Services || {}).forEach(
      name => (
        (config.Services[name]?.HealthCheck?.MaxFails > 0) && (
          config.Services[name].HealthCheck.Interval > 0 || config.Services[name].HealthCheck.FailTimeout > 0
        ) && (
          config.Services[name].name = name,
          (_service = healthCheckCache.get(config.Services[name])) && (
            Object.keys(config.Services[name].Endpoints || {}).forEach(
              target => (
                healthCheckTargets[target + '@' + name] = {
                  target,
                  service: _service,
                  alive: 1,
                  errorCount: 0,
                  failTick: 0,
                  tick: 0,
                }
              )
            )
          )
        )
      )
    )
  )
)

.task('1s')
.onStart(
  () => new Message
)
.replaceMessage(
  () => (
    Object.values(healthCheckTargets).forEach(
      target => (
        (target.service.interval > 0 && ++target.tick >= target.service.interval) && (
          target.tick = 0,
          target.service.check(target)
        )
      )
    ),
    new StreamEnd
  )
)

.task('1s')
.onStart(
  () => new Message
)
.replaceMessage(
  () => (
    Object.values(healthCheckTargets).forEach(
      target => (
        (target.alive === 0 && target.service.failTimeout > 0 && !(target.service.interval > 0)) && (
          (++target.failTick >= target.service.failTimeout) && (
            isDebugEnabled && (
              console.log('[health-check] reset - service, target, failTick:', target.name, target.target, target.failTick)
            ),
            target.service.ok(target)
          )
        )
      )
    ),
    new StreamEnd
  )
)

)()