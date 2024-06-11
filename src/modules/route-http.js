import makeBackendSelector from './backend-selector.js'
import makeForwarder from './forward-http.js'
import { stringifyHTTPHeaders } from '../utils.js'
import { log } from '../log.js'

var $ctx
var $selection

export default function (config, listener, routeResources) {
  var response404 = pipeline($=>$.replaceMessage(new Message({ status: 404 })))
  var response500 = pipeline($=>$.replaceMessage(new Message({ status: 500 })))

  var hostFullnames = {}
  var hostPostfixes = []

  routeResources.forEach(r => {
    var hostnames = r.spec.hostnames || ['*']
    var selector = makeRuleSelector(r)
    hostnames.forEach(name => {
      name = name.trim().toLowerCase()
      if (name.startsWith('*')) {
        hostPostfixes.push([name.substring(1), selector])
      } else {
        hostFullnames[name] = selector
      }
    })
  })

  function route(msg) {
    var head = msg.head
    var host = head.headers.host
    if (host) {
      host = host.toLowerCase()
      var i = host.lastIndexOf(':')
      if (i >= 0) host = host.substring(0, i)
      var selector = hostFullnames[host] || (
        hostPostfixes.find(
          ([postfix]) => host.endsWith(postfix)
        )?.[1]
      )
      if (selector) $selection = selector(head)
    }
    log?.(
      `Inb #${$ctx.inbound.id} Req #${$ctx.messageCount+1}`, head.method, head.path,
      `backend ${$selection?.target?.backendRef?.name}`,
      `headers ${stringifyHTTPHeaders(head.headers)}`,
    )
  }

  function makeRuleSelector(routeResource) {
    var rules = routeResource.spec.rules
    switch (routeResource.kind) {
      case 'HTTPRoute':
        rules = rules.map(r => {
          var matches = (r.matches || []).map(m => {
            var matchMethod = makeMethodMatcher(m.method)
            var matchPath = makePathMatcher(m.path)
            var matchHeaders = makeObjectMatcher(m.headers)
            var matchParams = makeObjectMatcher(m.queryParams)
            return function (head) {
              if (matchMethod && !matchMethod(head.method)) return false
              if (matchPath && !matchPath(head.path)) return false
              if (matchHeaders && !matchHeaders(head.headers)) return false
              if (matchParams && !matchParams(new URL(head.path).searchParams.toObject())) return false
              return true
            }
          })
          var matchAny = matches.length > 0 && (
            function (head) {
              return matches.some(f => f(head))
            }
          )
          return [matchAny, makeBackendSelector(config, 'http', r, makeBackendTarget)]
        })
        break
      case 'GRPCRoute':
      default: throw `route-http: unknown resource kind: '${resource.kind}'`
    }
    return function (head) {
      var r = rules.find(([matchAny]) => !matchAny || matchAny(head))
      if (r) return r[1]()
    }
  }

  function makeMethodMatcher(match) {
    if (match) {
      return method => method === match
    }
  }

  function makePathMatcher(match) {
    if (match) {
      var type = match.type
      var value = match.value
      switch (type) {
        case 'Exact':
          var patterns = new algo.URLRouter({ [value]: true, '/*': false })
          return path => patterns.find(path)
        case 'PathPrefix':
          var patterns = new algo.URLRouter({ [value + '/*']: true, '/*': false })
          return path => patterns.find(path)
        case 'RegularExpression':
          var re = new RegExp(value)
          return path => re.test(path)
        default: return () => false
      }
    }
  }

  function makeObjectMatcher(matches) {
    if (matches instanceof Array && matches.length > 0) {
      var exact = matches.filter(m => m.type === 'Exact').map(m => [m.name.toLowerCase(), m.value])
      var regex = matches.filter(m => m.type === 'RegularExpression').map(m => [m.name.toLowerCase(), new RegExp(m.value)])
      return (obj) => (
        exact.every(([k, v]) => v === (obj[k] || '')) &&
        regex.every(([k, v]) => v.test(obj[k] || ''))
      )
    }
  }

  function makeBackendTarget(rule, backendRef, backendResource, filters) {
    if (backendResource) {
      filters = [...filters, makeForwarder(config, rule, backendRef, backendResource)]
    } else {
      filters = [...filters, response500]
    }
    return {
      backendRef,
      backendResource,
      weight: backendRef?.weight || 1,
      pipeline: pipeline($=>$.pipe(filters, () => $ctx).onEnd(() => $selection.free?.()))
    }
  }

  return pipeline($=>$
    .onStart(c => void ($ctx = c))
    .demuxHTTP().to($=>$
      .handleMessageStart(
        function (msg) {
          route(msg)
          $ctx = {
            parent: $ctx,
            id: ++$ctx.messageCount,
            head: msg.head,
            headTime: Date.now(),
            tail: null,
            tailTime: 0,
            response: {
              head: null,
              headTime: 0,
              tail: null,
              tailTime: 0,
            },
            backendResource: $selection?.target?.backendResource,
          }
        }
      )
      .handleMessageEnd(
        function (msg) {
          $ctx.tail = msg.tail
          $ctx.tailTime = Date.now()
        }
      )
      .pipe(() => $selection ? $selection.target.pipeline : response404)
      .handleMessageStart(
        function (msg) {
          var r = $ctx.response
          r.head = msg.head
          r.headTime = Date.now()
        }
      )
      .handleMessageEnd(
        function (msg) {
          var r = $ctx.response
          r.tail = msg.tail
          r.tailTime = Date.now()
        }
      )
    )
  )
}
