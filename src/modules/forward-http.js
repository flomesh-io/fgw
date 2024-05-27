var $ctx
var $resource

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .pipe(
    () => selectTarget() ? 'forward' : 'bypass',
    {
      'forward': ($=>$
        .muxHTTP(() => $resource).to($=>$
          .connect(() => $resource.target.address)
        )
        .onEnd(() => $resource.free())
      ),
      'bypass': $=>$.pipeNext(),
    }
  )
)

function selectTarget() {
  $resource = loadBalancers.get($ctx.serviceConfig.Endpoints).allocate()
  return Boolean($resource)
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
