function startServer() {
  pipy.listen(8886, $=>$
    .serveHTTP(
      new Message('www-port-8886')
    )
  )

  pipy.listen(8887, $=>$
    .serveHTTP(
      new Message('www-port-8887')
    )
  )

  pipy.listen(8888, $=>$
    .serveHTTP(
      new Message('www-port-8888')
    )
  )

  pipy.listen(8889, $=>$
    .serveHTTP(
      new Message('www-port-8889')
    )
  )
}

function stopServer() {
  pipy.listen(8886, null)
  pipy.listen(8887, null)
  pipy.listen(8888, null)
  pipy.listen(8889, null)
}

export default function () {
  startServer()

  var requests = [
    ['www-port-8889', 'GET', '/path?abc=1', { a:1, b:2 }],
    ['www-port-8889', 'GET', '/path?def=2', { c:3 }],
    ['www-port-8889', 'GET', '/path?abc=1&def=2', { a:1, b:2 }],
    ['www-port-8888', 'GET', '/path?abc=1&def=2', { a:1, b:2, c:3 }],
    ['www-port-8886', 'GET', '/path/abc?def=2', { a:1, b:2, c:3 }],
    ['www-port-8889', 'GET', '/path?def=2', { a:2, b:2 }],
    ['www-port-8888', 'GET', '/path?abc=1&def=2', { a:1, b:2, c:3 }],
    ['www-port-8888', 'POST', '/path?abc=1&def=2', { a:1, b:2, c:3 }],
    ['www-port-8889', 'DELETE', '/path?def=2', { a:1, b:2 }],
    ['www-port-8889', 'GET', '/path?abc=2', { a:1, b:2 }],
    ['www-port-8889', 'GET', '/path?def=1', { a:1, b:2 }],
    ['www-port-8886', 'GET', '/path/abc', { a:1, b:2, c:3 }],
    ['www-port-8886', 'GET', '/path/abc/tail?def=1', { a:1, b:2, c:3 }],
    ['www-port-8886', 'GET', '/path/abc/tail', {}],
    ['www-port-8887', 'GET', '/path/tail', {}],
    ['www-port-8887', 'POST', '/path/abc/tail?def=1', { a:1, b:2, c:3 }],
    ['www-port-8888', 'GET', '/path/abc/tail?abc=1&def=2', { a:1, b:2, c:3 }],
    ['www-port-8888', 'GET', '/path/abc?abc=1&def=2', { a:1, b:2, c:3 }],
    ['www-port-8889', 'GET', '/path?def=2', { a:1, b:20, c:30 }],
    ['www-port-8889', 'GET', '/pat?def=2', { a:1, b:2, c:3 }],
  ]

  var c = new http.Agent('127.0.0.1:8080')

  return Promise.all(requests.map(
    ([_, method, path, headers]) => c.request(method, path, headers)
  )).then(results => {
    stopServer()
    var ok = true
    var indent = ' '.repeat(4)
    results.forEach(
      (res, i) => {
        var req = requests[i]
        var answer = res.body.toString()
        if (answer != req[0]) {
          print(indent)
          println(`Req #${i} expected ${req[0]} but got ${answer}`)
          ok = false
        }
      }
    )
    return ok
  }).catch(err => {
    stopServer()
    println(err)
    return false
  })
}
