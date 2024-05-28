var ca = new crypto.Certificate(os.read('ca.crt'))

var certificateA = {
  cert: new crypto.Certificate(os.read('client-a.crt')),
  key: new crypto.PrivateKey(os.read('client-a.key')),
}

var certificateB = {
  cert: new crypto.Certificate(os.read('client-b.crt')),
  key: new crypto.PrivateKey(os.read('client-b.key')),
}

function startServer() {
  pipy.listen(8850, $=>$
    .serveHTTP(
      new Message('hi')
    )
  )
}

function stopServer() {
  pipy.listen(8850, null)
}

function request(host, method, url, certificate) {
  var u = new URL(url)
  var c = new http.Agent(host, { tls: { certificate, sni: u.hostname, trusted: [ca] }})
  return c.request(method, u.path).catch(e => e)
}

export default function () {
  startServer()

  var indent = ' '.repeat(4)
  var tests = [
    ['https://www.test.com/', certificateA, res => res.head.status === 200],
    ['https://www.test.com/', certificateB, res => res.head.status === 502],
  ]

  return Promise.all(tests.map(
    ([url, cert]) => request('localhost:10443', 'GET', url, cert)
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
