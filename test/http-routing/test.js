export default function ({ log, fetchAll }) {
  [1, 2, 3, 4].forEach(i => {
    pipy.listen(8080 + i, $=>$
      .serveHTTP(
        new Message(`test-svc-${i}`)
      )
    )
  })

  var requests = [
    ['test-svc-4', 'GET', 'http://test.com/path?abc=1', { a:1, b:2 }],
    ['test-svc-4', 'GET', 'http://test.com/path?xyz=2', { c:3 }],
    ['test-svc-4', 'GET', 'http://test.com/path?abc=1&xyz=2', { a:1, b:2 }],
    ['test-svc-1', 'GET', 'http://test.com/path?abc=1&xyz=2', { a:1, b:2, c:3 }],
    ['test-svc-2', 'GET', 'http://test.com/path/abc?xyz=2', { a:1, b:2, c:3 }],
    ['test-svc-4', 'GET', 'http://test.com/path?xyz=2', { a:2, b:2 }],
    ['test-svc-1', 'GET', 'http://test.com/path?abc=1&xyz=2', { a:1, b:2, c:3 }],
    ['test-svc-1', 'GET', 'http://test.com/path?abc=1&xyz=2', { a:1, b:2, c:3 }],
    ['test-svc-4', 'DELETE', 'http://test.com/path?xyz=2', { a:1, b:2 }],
    ['test-svc-4', 'GET', 'http://test.com/path?abc=2', { a:1, b:2 }],
    ['test-svc-4', 'GET', 'http://test.com/path?xyz=1', { a:1, b:2 }],
    ['test-svc-2', 'GET', 'http://test.com/path/abc', { a:1, b:2, c:3 }],
    ['test-svc-2', 'GET', 'http://test.com/path/abc/tail?xyz=1', { a:1, b:2, c:3 }],
    ['test-svc-2', 'GET', 'http://test.com/path/abc/tail', {}],
    ['test-svc-3', 'GET', 'http://test.com/path/tail', {}],
    ['test-svc-2', 'GET', 'http://test.com/path/abc/tail?xyz=1', { a:1, b:2, c:3 }],
    ['test-svc-1', 'GET', 'http://test.com/path/abc/tail?abc=1&xyz=2', { a:1, b:2, c:3 }],
    ['test-svc-1', 'GET', 'http://test.com/path/abc?abc=1&xyz=2', { a:1, b:2, c:3 }],
    ['test-svc-4', 'GET', 'http://test.com/path?xyz=2', { a:1, b:20, c:30 }],
    ['test-svc-4', 'GET', 'http://test.com/pat?xyz=2', { a:1, b:2, c:3 }],
  ]

  return fetchAll(
    'localhost:8080',
    requests.map(
      ([_, method, path, headers]) => [method, path, headers]
    )
  ).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        var req = requests[i]
        var answer = res.body?.toString?.()
        var failed = (answer != req[0])
        if (failed) ok = false
        log(
          failed ? 'FAIL' : 'PASS', `#${i}`,
          `expecting '${req[0]}', got '${answer}' from ${req[2]}`
        )
      }
    )
    return ok
  }).finally(() => {
    [1, 2, 3, 4].forEach(i => pipy.listen(8080 + i, null))
  })
}
