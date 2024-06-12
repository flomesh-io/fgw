export default function ({ fetch, log }) {
  [1, 2].forEach(
    i => pipy.listen(8080 + i, $=>$
      .serveHTTP(
        req => {
          var body = `test-service-${i}`
          if (req.head.headers.cookie) {
            return new Message(body)
          } else {
            return new Message({
              headers: {
                'set-cookie': `user-id=${algo.uuid()}`,
              }
            }, body)
          }
        }
      )
    )
  )

  var results = []

  function extractCookies(res) {
    var cookies = res.head.headers['set-cookie'] || []
    if (typeof cookies === 'string') cookies = [cookies]
    return Object.fromEntries(
      cookies.map(
        value => {
          var kv = value.split('=')
          var k = kv[0].trim()
          var v = kv[1].trim()
          var i = v.indexOf(';')
          if (i >= 0) v = v.substring(0, i)
          return [k, v]
        }
      )
    )
  }

  return Promise.resolve().then(
    () => {
      return fetch('localhost:8080', 'GET', 'http://test.com/')
    }
  ).then(
    res => {
      var cookie = extractCookies(res)['user-id']
      results[0] = res.body?.toString?.()
      log(results[0], 'cookie = ', cookie)
      return fetch('localhost:8080', 'GET', 'http://test.com/', { cookie: `user-id=${cookie}`})
    }
  ).then(
    res => {
      results[1] = res.body?.toString?.()
      log(results[1])
      return fetch('localhost:8080', 'GET', 'http://test.com/')
    }
  ).then(
    res => {
      var cookie = extractCookies(res)['user-id']
      results[2] = res.body?.toString?.()
      log(results[2], 'cookie = ', cookie)
      return fetch('localhost:8080', 'GET', 'http://test.com/', { cookie: `user-id=${cookie}`})
    }
  ).then(
    res => {
      results[3] = res.body?.toString?.()
      log(results[3])
      return (
        results[0] === results[1] &&
        results[2] === results[3] &&
        results[0] !== results[2]
      )
    }
  ).finally(
    () => {
      [1, 2].forEach(i => pipy.listen(8080 + i, null))
    }
  )
}
