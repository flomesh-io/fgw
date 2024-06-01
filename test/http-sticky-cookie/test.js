function startServer() {
  [8081, 8082].forEach(
    port => pipy.listen(port, $=>$
      .serveHTTP(
        new Message(`hi ${port}`)
      )
    )
  )
}

function stopServer() {
  [8081, 8082].forEach(port => pipy.listen(port, null))
}

function request(path, headers) {
  var c = new http.Agent('localhost:8080')
  return c.request('GET', path, headers).catch(e => e)
}

function extractCookies(res) {
  var cookies = res.head.headers['set-cookie']
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

export default function () {
  startServer()

  var indent = ' '.repeat(4)
  var results = []

  return Promise.resolve().then(
    () => {
      return request('/')
    }
  ).then(
    res => {
      var cookie = extractCookies(res)['_srv_id']
      results[0] = res.body?.toString?.()
      print(indent)
      println('http://localhost:8080/', results[0], 'cookie =', cookie)
      return request('/', { cookie: `_srv_id=${cookie}`})
    }
  ).then(
    res => {
      var cookie = extractCookies(res)['_srv_id']
      results[1] = res.body?.toString?.()
      print(indent)
      println('http://localhost:8080/', results[1], 'cookie =', cookie)
      return request('/', { cookie: '_srv_id=xyz'})
    }
  ).then(
    res => {
      var cookie = extractCookies(res)['_srv_id']
      results[2] = res.body?.toString?.()
      print(indent)
      println('http://localhost:8080/', results[2], 'cookie =', cookie)
      return request('/', { cookie: `_srv_id=${cookie}`})
    }
  ).then(
    res => {
      var cookie = extractCookies(res)['_srv_id']
      results[3] = res.body?.toString?.()
      print(indent)
      println('http://localhost:8080/', results[3], 'cookie =', cookie)
      return (
        results[0] === results[1] &&
        results[2] === results[3] &&
        results[0] !== results[2]
      )
    }
  ).catch(
    err => {
      println(err)
      return false
    }
  ).finally(stopServer)
}
