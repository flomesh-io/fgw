export default function ({ fetch, log }) {
  [1, 2].forEach(
    i => pipy.listen(8080 + i, $=>$
      .serveHTTP(
        new Message(`test-svc-${i}`)
      )
    )
  )

  var tests = [
    ['https://a.b.example.com/', res => res.head.status === 200 && res.body?.toString?.() === 'test-svc-1'],
    ['https://a.b.c.test.com/', res => res.head.status === 200 && res.body?.toString?.() === 'test-svc-2'],
    ['https://no.test.com/', res => res.head.status === 502],
  ]

  return Promise.all(
    tests.map(
      ([url]) => fetch('localhost:8443', 'GET', url)
    )
  ).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        var url = tests[i][0]
        var chk = tests[i][1]
        if (chk(res)) {
          log(url, 'OK')
        } else {
          log(url, 'WRONG!', res.head)
          ok = false
        }
      }
    )
    return ok
  }).finally(
    () => [1, 2].forEach(i => pipy.listen(8080 + i, null))
  )
}
