import makeBackendSelector from './backend-selector.js'
import makeForwarder from './forward-tcp.js'
import { log } from '../log.js'

var $ctx
var $proto
var $selection

export default function (config, listener, routeResources) {
  var shutdown = pipeline($=>$.replaceStreamStart(new StreamEnd))

  var hostFullnames = {}
  var hostPostfixes = []

  routeResources.forEach(r => {
    var hostnames = r.spec.hostnames || ['*']
    hostnames.forEach(name => {
      var f = makeBackendSelector(config, 'tcp', r.spec.rules?.[0], makeBackendTarget)
      name = name.trim().toLowerCase()
      if (name.startsWith('*')) {
        hostPostfixes.push([name.substring(1), f])
      } else {
        hostFullnames[name] = f
      }
    })
  })

  function route(hello) {
    var sni = hello.serverNames[0] || ''
    var name = sni.toLowerCase()
    var selector = hostFullnames[name] || (
      hostPostfixes.find(
        ([postfix]) => name.endsWith(postfix)
      )?.[1]
    )
    $selection = selector?.() || null
    log?.(
      `In #${$ctx.inbound.id}`,
      `sni ${sni}`,
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
      backend: backendResource,
      weight: backendRef?.weight || 1,
      pipeline: pipeline($=>$.pipe(filters, () => $ctx).onEnd(() => $selection.free?.()))
    }
  }

  return pipeline($=>$
    .onStart(c => void ($ctx = c))
    .detectProtocol(proto => void ($proto = proto))
    .pipe(
      () => {
        if ($proto !== undefined) {
          log?.(`In #${$ctx.inbound.id} protocol ${$proto || 'unknown'}`)
          return $proto === 'TLS' ? 'pass' : 'deny'
        }
      }, {
        'pass': ($=>$
          .handleTLSClientHello(route)
          .pipe(
            () => {
              if ($selection !== undefined) {
                return $selection ? 'pass' : 'deny'
              }
            }, {
              'pass': $=>$.pipe(() => $selection.target.pipeline),
              'deny': $=>$.replaceStreamStart(new StreamEnd),
            }
          )
        ),
        'deny': $=>$.replaceStreamStart(new StreamEnd),
      }
    )
  )
}
