function startServer() {
  var cert = new crypto.Certificate(os.read('server.crt'))
  var key = new crypto.PrivateKey(os.read('server.key'))

  ;[8850, 8889].forEach(
    port => {
      pipy.listen(port, $=>$
        .acceptTLS({
          certificate: { cert, key }
        }).to($=>$
          .serveHTTP(new Message(`www-port-${port}`))
        )
      )
    }
  )
}

function stopServer() {
  [8850, 8889].forEach(
    port => pipy.listen(port, null)
  )
}

function request(url) {
  var u = new URL(url)
  var c = new http.Agent('127.0.0.1:9444', {
    tls: {
      sni: u.hostname,
    }
  })
  return c.request('GET', u.path, { host: u.host }).catch(e => e)
}

export default function () {
  startServer()

  var indent = ' '.repeat(4)
  var tests = [
    ['https://test.com:9444/', res => res.body.toString() === 'www-port-8889'],
    ['https://www.test.com:9444/', res => res.body.toString() === 'www-port-8850'],
    ['https://no.test.com:9444/', res => res.head.status === 502],
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
