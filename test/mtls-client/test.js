var ca = new crypto.Certificate(os.read('ca.crt'))

var certificateA = {
  cert: new crypto.Certificate(os.read('client-a.crt')),
  key: new crypto.PrivateKey(os.read('client-a.key')),
}

var certificateB = {
  cert: new crypto.Certificate(os.read('client-b.crt')),
  key: new crypto.PrivateKey(os.read('client-b.key')),
}

export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      new Message('hi')
    )
  )

  var tests = [
    ['https://www.test.com/', certificateA, res => res.head.status === 200],
    ['https://www.test.com/', certificateB, res => res.head.status === 502],
  ]

  return Promise.all(tests.map(
    ([url, cert]) => fetch(
      'localhost:8443', 'GET', url, {}, null, {
        certificate: cert,
        trusted: [ca],
      }
    )
  )).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        var check = tests[i][2]
        if (check(res)) {
          log(tests[i][0], 'PASS')
        } else {
          log(tests[i][0], 'FAIL')
          ok = false
        }
      }
    )
    return ok
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
