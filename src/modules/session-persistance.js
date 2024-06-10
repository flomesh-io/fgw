var $sessionKey
var $sessionTargetKey

export default function (sessionPersistance) {
  var sessionCache = new algo.Cache
  var sessionKeyGetter

  switch (sessionPersistance.type || 'Cookie') {
    case 'Cookie': sessionKeyGetter = makeCookieSessionKeyGetter(); break
    case 'Header': sessionKeyGetter = makeHeaderSessionKeyGetter(); break
  }

  function restore(head) {
    $sessionKey = sessionKeyGetter(head.headers)
    $sessionTargetKey = $sessionKey && sessionCache.get($sessionKey)
    return $sessionTargetKey
  }

  function preserve(head) {
  }

  function makeCookieSessionKeyGetter() {
    var cookiePrefix = sessionPersistance.sessionName + '='
    return (headers) => {
      var cookies = headers.cookie
      if (cookies) {
        var cookie = cookies.split(';').find(c => c.trim().startsWith(cookiePrefix))
        if (cookie) return cookie.substring(prefix.length).trim()
      }
    }
  }

  function makeHeaderSessionKeyGetter() {
    var headerName = sessionPresistance.sessionName
    return (headers) => headers[headerName]
  }

  return { restore, preserve }
}
