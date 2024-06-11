import makeBackendSelector from './backend-selector.js'
import makeForwarder from './forward-tcp.js'
import { log } from '../log.js'

var $ctx
var $selection

export default function (config, listener, routeResources) {
  var shutdown = pipeline($=>$.replaceStreamStart(new StreamEnd))

  var selector = makeBackendSelector(
    config, 'tcp',
    routeResources[0]?.spec?.rules?.[0],
    makeBackendTarget
  )

  function route() {
    $selection = selector()
    log?.(
      `Inb #${$ctx.inbound.id}`,
      `backend ${$selection?.target?.backendRef?.name}`
    )
  }

  function makeBackendTarget(rule, backendRef, backendResource, filters) {
    if (backendResource) {
      filters = [...filters, makeForwarder(config, rule, backendRef, backendResource)]
    } else {
      filters = [...filters, shutdown]
    }
    return {
      backendRef,
      backendResource,
      weight: backendRef?.weight || 1,
      pipeline: pipeline($=>$.pipe(filters, () => $ctx).onEnd(() => $selection.free?.()))
    }
  }

  return pipeline($=>$
    .onStart(c => {
      $ctx = c
      route()
    })
    .pipe(() => $selection ? 'pass' : 'deny', {
      'pass': $=>$.pipe(() => $selection.target.pipeline),
      'deny': $=>$.replaceStreamStart(new StreamEnd),
    })
  )
}

// pipeline($=>$
//   .onStart(c => void ($ctx = c))
//   .pipe(
//     () => findService() ? 'pass' : 'deny', {
//       'pass': $=>$.pipe(forward, () => $ctx).onEnd(() => $resource.free()),
//       'deny': $=>$.replaceStreamStart(new StreamEnd),
//     }
//   )
// )

// function findService() {
//   var portConfig = $ctx.portConfig
//   if (!portConfig) return false
//   var lb = loadBalancers.get(portConfig)
//   $resource = lb.allocate()
//   if (!$resource) return false
//   $ctx.serviceConfig = $ctx.config.Services[$ctx.serviceName = $resource.target.id]
//   return true
// }

// var loadBalancers = new algo.Cache(
//   portConfig => new algo.LoadBalancer(
//     Object.entries(portConfig).map(
//       ([k, v]) => ({ id: k, weight: v })
//     ), {
//       weight: t => t.weight,
//     }
//   )
// )
