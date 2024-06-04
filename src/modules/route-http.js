import config from '../config.js'
import { makeFilters } from '../utils.js'

var allServices = config.Services

var $ctx
var $resource
var $filters

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .demuxHTTP().to($=>$
    .handleMessageStart(
      function (msg) {
        $ctx = {
          parent: $ctx,
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
          routeConfig: null,
          serviceName: '',
          serviceConfig: null,
        }
        route(msg)
      }
    )
    .handleMessageEnd(
      function (msg) {
        $ctx.tail = msg.tail
        $ctx.tailTime = Date.now()
      }
    )
    .pipe(() => $resource ? 'pass' : 'deny', {
      'pass': $=>$.pipeNext(() => $ctx).onEnd(() => $resource.free()),
      'deny': $=>$.replaceMessage(new Message({ status: 404 }, 'Not found'))
    })
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

function route(msg) {
  var hostRouter = $ctx.parent.hostRouter
  var hostConfig
  var routeConfig
  var services
  var head = msg.head
  var host = head.headers.host
  if (host) {
    hostConfig = hostRouter(host)
    if (!hostConfig) {
      var i = host.lastIndexOf(':')
      if (i >= 0) hostConfig = hostRouter(host.substring(0, i))
    }
  }
  if (!hostConfig) {
    var sni = $ctx.parent.serverName
    if (sni) {
      hostConfig = hostRouter(sni)
    }
  }
  if (!hostConfig) return
  if (!hostConfig.Matches) {
    services = hostConfig
  } else {
    routeConfig = httpRouters.get(hostConfig)(head)
    services = routeConfig?.BackendService
  }
  if (!services) return
  $resource = serviceLoadBalancers.get(services).allocate()
  $ctx.serviceConfig = allServices[$ctx.serviceName = $resource.target.id]
  $ctx.routeConfig = routeConfig
  $filters = $resource.target.filters
}

var httpRouters = new algo.Cache(
  function (hostConfig) {
    var routes = hostConfig.Matches || []
    switch (hostConfig.RouteType) {
      case 'GRPC':
        routes = routes.map(
          function (config) {
            var matchPath = config.Method && makeGRPCPathMather(config.Method)
            var matchHeaders = config.Headers && makeObjectMatcher(config.Headers)
            var check = function (head) {
              if (matchPath && !matchPath(head.path)) return false
              if (matchHeaders && !matchHeaders(head.headers)) return false
              return true
            }
            return { check, config }
          }
        )
        break
      case 'HTTP':
      case 'HTTP2':
      default:
        routes = routes.map(
          function (config) {
            var matchMethod = config.Methods && makeMethodMatcher(config.Methods)
            var matchPath = config.Path && makePathMatcher(config.Path)
            var matchHeaders = config.Headers && makeObjectMatcher(config.Headers)
            var matchParams = config.QueryParams && makeObjectMatcher(config.QueryParams)
            var check = function (head) {
              if (matchMethod && !matchMethod(head.method)) return false
              if (matchPath && !matchPath(head.path)) return false
              if (matchHeaders && !matchHeaders(head.headers)) return false
              if (matchParams && !matchParams(new URL(head.path).searchParams.toObject())) return false
              return true
            }
            var routeFilters = makeFilters('http', config.Filters)
            Object.entries(config.BackendService).forEach(
              ([k, v]) => {
                var svc = allServices[k]
                var filters = [
                  ...hostFilters.get(hostConfig),
                  ...routeFilters,
                  ...makeFilters('http', svc?.Filters)
                ]
                if (filters.length > 0) {
                  v.filters = pipeline($=>$.pipe(filters))
                }
              }
            )
            return { check, config }
          }
        )
        break
    }
    return function (head) {
      return routes.find(({ check }) => check(head))?.config
    }
  }
)

var serviceLoadBalancers = new algo.Cache(
  services => new algo.LoadBalancer(
    Object.entries(services).filter(([id]) => id !== 'filters').map( // TODO: Remove this ugly patch
      ([id, v]) => ({
        id,
        weight: v.Weight,
        filters: v.filters,
      })
    ), {
      weight: t => t.weight,
    }
  )
)

function makeMethodMatcher(methods) {
  var set = Object.fromEntries(methods.map(m => [m, true]))
  return method => method in set
}

function makePathMatcher(rule) {
  switch (rule.Type) {
    case 'Exact':
      var patterns = new algo.URLRouter({ [rule.Path]: true, '/*': false })
      return path => patterns.find(path)
    case 'Prefix':
      var patterns = new algo.URLRouter({ [rule.Path + '/*']: true, '/*': false })
      return path => patterns.find(path)
    case 'Regex':
      var re = new RegExp(rule.Path)
      return path => re.test(path)
    default: return () => false
  }
}

function makeObjectMatcher(rule) {
  var exact = rule.Exact && Object.entries(rule.Exact)
  var regex = rule.Regex && Object.entries(rule.Regex).map(([k, v]) => [k, new RegExp(v)])
  return function (obj) {
    if (exact && exact.some(([k, v]) => (v !== (obj[k] || '')))) return false
    if (regex && regex.some(([k, v]) => !v.test(obj[k] || ''))) return false
    return true
  }
}

function makeGRPCPathMather(rule) {
  switch (rule.Type) {
    case 'Exact':
      var prefix = rule.Service && `/${rule.Service}/`
      var postfix = rule.Method && `/${rule.Method}`
      return path => (
        path.startsWith('/grpc.reflection.') || (
          (!prefix || path.startsWith(prefix)) &&
          (!postfix || path.endsWith(postfix))
        )
      )
    default: return () => false
  }
}

var hostFilters = new algo.Cache(
  hostConfig => {
    if ('Matches' in hostConfig) {
      return makeFilters('http', hostConfig.Filters)
    }
  }
)
