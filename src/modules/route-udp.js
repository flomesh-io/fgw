import makeBackendSelector from './backend-selector.js'
import makeForwarder from './forward-udp.js'
import { log } from '../log.js'

var $ctx
var $selection

export default function (config, listener, routeResources) {
  var shutdown = pipeline($=>$.replaceStreamStart(new StreamEnd))

  var selector = makeBackendSelector(
    config, 'udp',
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
    .pipe(() => $selection ? $selection.target.pipeline : shutdown)
  )
}
