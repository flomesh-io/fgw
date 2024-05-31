function startServer() {
  pipy.listen(8081, $=>$
    .serveHTTP(new Message('hi'))
  )
}

function stopServer() {
  pipy.listen(8081, null)
}

export default function () {
  startServer()

  var indent = ' '.repeat(4)
  var c = new http.Agent('localhost:8080')

  return Promise.all([
    c.request('GET', '/'),
    c.request('GET', '/'),
  ]).then(results => {
    var ok = false
    results.forEach(
      res => {
        print(indent)
        println('http://localhost:8080/', res.head.status)
        if (res.head.status === 502) ok = true
      }
    )
    if (!ok) return false
    print(indent)
    println('Sleeping for 33 seconds...')
    return new Timeout(33).wait()
  }).then(() => Promise.all([
    c.request('GET', '/'),
    c.request('GET', '/'),
  ])).then(results => {
    var ok = true
    results.forEach(
      res => {
        print(indent)
        println('http://localhost:8080/', res.head.status)
        if (res.head.status !== 200) ok = false
      }
    )
    return ok
  }).catch(err => {
    println(err)
    return false
  }).finally(stopServer)
}
