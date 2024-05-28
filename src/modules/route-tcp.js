var $ctx
var $resource

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .pipe(
    () => findService() ? 'pass' : 'deny', {
      'pass': $=>$.pipeNext().onEnd(() => $resource.free()),
      'deny': $=>$.replaceStreamStart(new StreamEnd),
    }
  )
)

function findService() {
  var portConfig = $ctx.portConfig
  if (!portConfig) return false
  var lb = loadBalancers.get(portConfig)
  $resource = lb.allocate()
  if (!$resource) return false
  $ctx.serviceConfig = $ctx.config.Services[$ctx.serviceName = $resource.target.id]
  return true
}

var loadBalancers = new algo.Cache(
  portConfig => new algo.LoadBalancer(
    Object.entries(portConfig).map(
      ([k, v]) => ({ id: k, weight: v })
    ), {
      weight: t => t.weight,
    }
  )
)
