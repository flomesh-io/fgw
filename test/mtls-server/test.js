var ca = new crypto.Certificate(os.read('ca.crt'))

var certificate = {
  cert: new crypto.Certificate(os.read('server.crt')),
  key: new crypto.PrivateKey(os.read('server.key')),
}

function startServer() {
  pipy.listen(8850, $=>$
    .acceptTLS({
      certificate,
      trusted: [ca],
    }).to($=>$
      .serveHTTP(
        new Message('hi')
      )
    )
  )
}

function stopServer() {
  pipy.listen(8850, null)
}

function request(host, method, url) {
  var u = new URL(url)
  var c = new http.Agent(host, u.protocol === 'https:' ? { tls: { sni: u.hostname }} : {})
  return c.request(method, u.path, { host: u.host }).catch(e => e)
}

export default function () {
  startServer()

  var indent = ' '.repeat(4)
  var tests = [
    ['localhost:10443', 'https://www.test.com/', res => res.head.status === 200],
    ['localhost:10080', 'http://127.0.0.1/path/abc', res => res.head.status === 200],
    ['localhost:10080', 'http://127.0.0.1/path/tail', res => res.head.status === 502],
  ]

  return Promise.all(tests.map(
    ([host, url]) => request(host, 'GET', url)
  )).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        print(indent)
        var check = tests[i][2]
        if (check(res)) {
          println(tests[i][0], 'PASS')
        } else {
          println(tests[i][0], 'FAIL')
          ok = false
        }
      }
    )
    return ok
  }).finally(stopServer)
}
