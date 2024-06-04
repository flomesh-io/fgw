function startServer() {
  [8846, 8847, 8848, 8849].forEach(
    port => pipy.listen(port, $=>$
      .serveHTTP(
        new Message(`www-port-${port}`)
      )
    )
  )
}

function stopServer() {
  [8846, 8847, 8848, 8849].forEach(
    port => pipy.listen(port, null)
  )
}

export default function () {
  var indent = ' '.repeat(4)

  startServer()

  var requests = [
    ['www-port-8846', 'https://test.com:10443/com.example.GreetingService/Hello', { canary: true, version: 2, region: 'gz' }],
    ['www-port-8847', 'https://test.com:10443/com.example.secure/login', { canary: true, version: 2, region: 'gz' }],
    ['www-port-8849', 'https://test.com:10443/com.example.GreetingService/hello', { canary: true }],
    ['www-port-8849', 'https://test.com:10443/com.example.GreetingService/Hello', { canary: false }],
    ['www-port-8849', 'https://test.com:10443/com.example.GreetingService/Hello', { canary: false, version: 2, region: 'gd' }],
    ['www-port-8849', 'https://test.com:10443/com.example.secure/login', { canary: false, version: 2, region: 'gd' }],
    ['www-port-8846', 'https://test.com:10443/com.example.GreetingService/Hello', { canary: true, version: 2, region: 'gz' }],
    ['www-port-8847', 'https://test.com:10443/com.example.secure/login', { canary: true, version: 2, region: 'gd' }],
    ['www-port-8849', 'https://test.com:10443/com.example.GreetingServic/Hello', { canary: true }],
    ['www-port-8849', 'https://test.com:10443/com.example.secure/Login', { canary: true }],
    ['www-port-8849', 'https://test.com:10443/com.example.sec/login', { canary: true }],
  ]

  var c = new http.Agent('localhost:10443', { tls: {}})

  return Promise.all(requests.map(
    ([_, url, headers]) => {
      var u = new URL(url)
      return c.request('GET', u.path, { host: u.hostname, ...headers })
    }
  )).then(results => {
    var ok = true
    results.forEach(
      (res, i) => {
        var req = requests[i]
        var answer = res.body.toString()
        if (answer != req[0]) ok = false
        print(indent)
        println(
          ok ? 'PASS' : 'FAIL', `#${i}`,
          `expecting '${req[0]}', got '${answer}' from ${req[1]}`
        )
      }
    )
    return ok
  }).catch(err => {
    print(indent)
    println(err)
    return false
  }).finally(stopServer)
}
