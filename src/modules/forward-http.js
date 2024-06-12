import makeHealthCheck from './health-check.js'
import makeSessionPersistence from './session-persistence.js'
import { stringifyHTTPHeaders, findPolicies } from '../utils.js'
import { log } from '../log.js'

var $ctx
var $selection

export default function (config, backendRef, backendResource) {
  var tlsPolicies = []

  var backendLBPolicies = findPolicies(config, 'BackendLBPolicy', backendResource)
  var sessionPersistenceConfig = backendLBPolicies.find(r => r.spec.sessionPersistence)?.spec?.sessionPersistence
  var sessionPersistence = sessionPersistenceConfig && makeSessionPersistence(sessionPersistenceConfig)

  var targets = backendResource.spec.targets.map(t => {
    var port = t.port || backendRef.port
    var address = `${t.address}:${port}`
    var weight = t.weight
    return { address, weight }
  })

  var loadBalancer = new algo.LoadBalancer(
    targets, {
      key: t => t.address,
      weight: t => t.weight,
    }
  )

  var isHealthy = (target) => true

  if (sessionPersistence) {
    var restoreSession = sessionPersistence.restore
    var targetSelector = function (req) {
      $selection = loadBalancer.allocate(
        restoreSession(req.head),
        target => isHealthy(target.address)
      )
    }
  } else {
    var targetSelector = function () {
      $selection = loadBalancer.allocate(null, isHealthy)
    }
  }

  return pipeline($=>{
    $.onStart(c => void ($ctx = c))
    $.pipe(evt => {
      if (evt instanceof MessageStart) {
        targetSelector(evt)
        log?.(
          `Inb #${$ctx.parent.inbound.id} Req #${$ctx.id}`, evt.head.method, evt.head.path,
          `forward ${$selection?.target?.address}`,
          `headers ${stringifyHTTPHeaders(evt.head.headers)}`,
        )
        return $selection ? forward : reject
      }
    })

    if (log) {
      $.handleMessageStart(
        res => log?.(
          `Inb #${$ctx.parent.inbound.id} Req #${$ctx.id}`, $ctx.head.method, $ctx.head.path,
          `return ${res.head.status} ${res.head.statusText}`,
          `headers ${stringifyHTTPHeaders(res.head.headers)}`,
        )
      )
    }

    var reject = pipeline($=>$
      .replaceMessage(
        new Message({ status: 500 })
      )
    )

    var forward = pipeline($=>{
      $.muxHTTP(() => $selection).to($=>{
        if (tlsPolicies.length > 0) {
          $.connectTLS({
            trusted: [],
          }).to(connect)
        } else {
          connect($)
        }
      })

      if (sessionPersistence) {
        var preserveSession = sessionPersistence.preserve
        $.handleMessageStart(
          res => preserveSession(res.head, $selection.target.address)
        )
      }

      $.onEnd(() => $selection.free())
    })

    function connect($) {
      $.connect(() => $selection.target.address)
    }
  })
}
