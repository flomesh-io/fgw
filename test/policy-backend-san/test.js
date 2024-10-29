export default function ({ fetch, log }) {
  pipy.listen(8443, $=>$
    .acceptTLS({
      certificate: {
        cert: new crypto.Certificate(os.read('www.test.com.crt')),
        key: new crypto.PrivateKey(os.read('www.test.com.key')),
      }
    }).to($=>$
      .serveHTTP(
        new Message('hi')
      )
    )
  )

  var tests = [
    ['http://www.test1.com/', res => res.head.status === 200],
    ['http://www.test2.com/', res => res.head.status === 502],
    ['http://www.test3.com/', res => res.head.status === 502],
  ]

  return Promise.all(tests.map(
    ([url]) => fetch('localhost:8000', 'GET', url)
  )).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        var url = tests[i][0]
        var check = tests[i][1]
        if (check(res)) {
          log(url, 'PASS', res.head)
        } else {
          log(url, 'FAIL', res.head)
          ok = false
        }
      }
    )
    return ok
  }).finally(() => {
    pipy.listen(8443, null)
  })
}
