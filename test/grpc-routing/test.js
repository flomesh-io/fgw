export default function ({ fetchAll, log }) {
  [0, 1, 2].forEach(i => pipy.listen(8080 + i, $=>$
    .serveHTTP(
      new Message(`test-svc-${i}`)
    )
  ))

  var requests = [
    ['test-svc-1', 'http://test.com/com.example.GreetingService/Hello', { canary: true, version: 2, region: 'gz' }],
    ['test-svc-2', 'http://test.com/com.example.secure/login', { canary: true, version: 2, region: 'gz' }],
    ['test-svc-0', 'http://test.com/com.example.GreetingService/hello', { canary: true }],
    ['test-svc-0', 'http://test.com/com.example.GreetingService/Hello', { canary: false }],
    ['test-svc-0', 'http://test.com/com.example.GreetingService/Hello', { canary: false, version: 2, region: 'gd' }],
    ['test-svc-0', 'http://test.com/com.example.secure/login', { canary: false, version: 2, region: 'gd' }],
    ['test-svc-1', 'http://test.com/com.example.GreetingService/Hello', { canary: true, version: 2, region: 'gz' }],
    ['test-svc-2', 'http://test.com/com.example.secure/login', { canary: true, version: 2, region: 'gd' }],
    ['test-svc-0', 'http://test.com/com.example.GreetingServic/Hello', { canary: true }],
    ['test-svc-0', 'http://test.com/com.example.secure/Login', { canary: true }],
    ['test-svc-0', 'http://test.com/com.example.sec/login', { canary: true }],
  ]

  var c = new http.Agent('localhost:10443', { tls: {}})

  return fetchAll('localhost:8000', requests.map(
    ([_, url, headers]) => ['GET', url, headers]
  )).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        var req = requests[i]
        var answer = res.body?.toString?.()
        var failed = (answer != req[0])
        if (failed) ok = false
        log(
          failed ? 'FAIL' : 'PASS', `#${i}`,
          `expecting '${req[0]}', got '${answer}' from ${req[1]}`
        )
      }
    )
    return ok
  }).finally(() => {
    [0, 1, 2].forEach(i => pipy.listen(8080 + i, null))
  })
}
