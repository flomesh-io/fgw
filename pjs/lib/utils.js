
export var toInt63 = str => (
  new Int("u64", new Data(str, "hex").toArray()).toString() / 2
)

export var traceId = () => algo.uuid().substring(0, 18).replaceAll('-', '')

export var namespace = (os.env.POD_NAMESPACE || 'default')
export var kind = (os.env.POD_CONTROLLER_KIND || 'Deployment')
export var name = (os.env.SERVICE_ACCOUNT || 'fgw')
export var pod = (os.env.POD_NAME || '')

export var initRateLimit = rateLimit => (
  rateLimit ? (
    {
      mode: rateLimit.Mode, // default "Local"
      count: 0,
      backlog: rateLimit.Backlog || 0,
      quota: new algo.Quota(
        rateLimit.Burst || rateLimit.Requests || 0,
        {
          produce: rateLimit.Requests || 0,
          per: rateLimit.StatTimeWindow || 0,
        }
      ),
      response: new Message({
        status: rateLimit.ResponseStatusCode || 429,
        headers: rateLimit.ResponseHeadersToAdd || {},
      }),
    }
  ) : null
)

export var shuffle = arg => (
  (
    sort = a => (a.map(e => e).map(() => a.splice(Math.random() * a.length | 0, 1)[0])),
  ) => (
    arg ? Object.fromEntries(sort(sort(Object.entries(arg)))) : {}
  )
)()

export var failover = json => (
  json ? ((obj = null) => (
    obj = Object.fromEntries(
      Object.entries(json).map(
        ([k, v]) => (
          (v === 0) ? ([k, 1]) : null
        )
      ).filter(e => e)
    ),
    Object.keys(obj).length === 0 ? null : new algo.RoundRobinLoadBalancer(obj)
  ))() : null
)

export var getNonNegativeNumber = num => (
  (
    n = +num,
    str = ('' + num).toLowerCase(),
  ) => (
    str.endsWith('m') ? (
      n = +str.substring(0, str.length - 1) * 1000000
    ) : str.endsWith('k') && (
      n = +str.substring(0, str.length - 1) * 1000
    ),
    (n >= 0) ? (
      n
    ) : (
      console.log(`Bad non-negative number: ${num}, set it to a default value of 0.`),
      0
    )
  )
)()
