var $ctx

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .handleMessageStart(route)
  .pipeNext()
)

function route(msg) {
  var head = msg.head
  var host = head.headers.host
  var hostRules = hostRouters.get($ctx.parent.rules)(host)
  $ctx.route = httpRouters.get(hostRules)(head)
}

var hostRouters = new algo.Cache(
  function (rules) {
    var fullnames = {}
    var postfixes = []
    Object.entries(rules).forEach(
      ([names, rules]) => (
        names.split(',').forEach(
          name => {
            name = name.trim().toLowerCase()
            if (name.startsWith('*')) {
              postfixes.push([name.substring(1), rules])
            } else {
              fullnames[name] = rules
            }
          }
        )
      )
    )
    return function (name) {
      name = name.toLowerCase()
      var rules = fullnames[name]
      if (rules) return rules
      return postfixes.find(
        ([postfix]) => name.endsWith(postfix)
      )?.[1]
    }
  }
)

var httpRouters = new algo.Cache(
  function (rules) {
    var routes = rules.Matches || []
    switch (rules.RouteType) {
      case 'GRPC':
        routes = routes.map(
          function (match) {
          }
        )
        break
      case 'HTTP':
      case 'HTTP2':
      default:
        routes = routes.map(
          function (route) {
            var matchMethod = route.Methods && makeMethodMatcher(route.Methods)
            var matchPath = route.Path && makePathMatcher(route.Path)
            var matchHeaders = route.Headers && makeObjectMatcher(route.Headers)
            var matchParams = route.QueryParams && makeObjectMatcher(route.QueryParams)
            var check = function (head) {
              if (matchMethod && !matchMethod(head.method)) return false
              if (matchPath && !matchPath(head.path)) return false
              if (matchHeaders && !matchHeaders(head.headers)) return false
              if (matchParams && !matchParams(new URL(head.path).searchParams.toObject())) return false
              return true
            }
            return { check, route }
          }
        )
        break
    }
    return function (head) {
      return routes.find(({ check }) => check(head))?.route
    }
  }
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
