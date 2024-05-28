var $ctx
var $resource
var $target

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .wait(() => findTarget())
  .connect(() => $target)
  .onEnd(() => $resource?.free?.())
)

function findTarget() {
  var serviceConfig = $ctx.serviceConfig
  if (serviceConfig) {
    findTargetByService(serviceConfig)
    return true
  }

  var hostConfig = $ctx.hostConfig
  if (hostConfig) {
    findTargetByHost(hostConfig)
    return true
  }

  return false
}

function findTargetByService(serviceConfig) {
  var lb = loadBalancers.get(serviceConfig.Endpoints)
  $resource = lb.allocate()
  if ($resource) $target = $resource.target.address
}

function findTargetByHost(hostConfig) {
  if (typeof hostConfig === 'string') {
    $target = hostConfig
    if ($target.indexOf(':') < 0) {
      $target += ':' + ($ctx.config.Configs.DefaultPassthroughUpstreamPort || 443)
    }
  }
}

var loadBalancers = new algo.Cache(
  endpoints => new algo.LoadBalancer(
    Object.entries(endpoints).map(
      ([k, v]) => ({ address: k, weight: v.Weight, tags: v.Tags })
    ), {
      weight: t => t.weight,
    }
  )
)
