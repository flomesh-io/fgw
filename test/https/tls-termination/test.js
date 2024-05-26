function startServer() {
  pipy.listen(8850, $=>$
    .serveHTTP(
      new Message('www-port-8850')
    )
  )

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
}

function stopServer() {
  pipy.listen(8850, null)
  pipy.listen(8886, null)
  pipy.listen(8887, null)
  pipy.listen(8888, null)
}

function request(url) {
  var u = new URL(url)
  var c = new http.Agent('127.0.0.1:9443', {
    tls: {
      sni: u.hostname,
    }
  })
  return c.request('GET', u.path, { host: u.host })
}

export default function () {
  startServer()

  var indent = ' '.repeat(4)
  var tests = [
    ['https://test.com:9443/', res => res.body.toString() === 'www-port-8850'],
    ['https://www.test.com:9443/', res => res.body.toString().startsWith('www-port-888')],
    ['https://no.test.com:9443/', res => res.head.status === 404],
  ]

  return Promise.all(
    tests.map(
      ([url]) => request(url)
    )
  ).then(results => {
    stopServer()
    var ok = true
    results.forEach(
      (res, i) => {
        print(indent)
        print(tests[i][0])
        var check = tests[i][1]
        if (check(res)) {
          println(' OK')
        } else {
          println(' WRONG!')
          ok = false
        }
      }
    )
    return ok
  }).catch(err => {
    stopServer()
    print(indent)
    println(err)
    return false
  })
}
