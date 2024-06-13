export default function ({ fetch, log }) {
  pipy.listen(8081, $=>$
    .serveHTTP(new Message('hi'))
  )

  return Promise.all([
    fetch('localhost:8080', 'GET', 'http://www.test.com/'),
    fetch('localhost:8080', 'GET', 'http://www.test.com/'),
  ]).then(results => {
    var ok = false
    results.forEach(
      res => {
        log('http://www.test.com:8080/', res.head.status)
        if (res.head.status === 502) ok = true
      }
    )
    if (!ok) return false
    log('Sleeping for 18 seconds...')
    return new Timeout(18).wait()
  }).then(() => Promise.all([
    fetch('localhost:8080', 'GET', 'http://www.test.com/'),
    fetch('localhost:8080', 'GET', 'http://www.test.com/'),
  ])).then(results => {
    var ok = true
    results.forEach(
      res => {
        log('http://www.test.com:8080/', res.head.status)
        if (res.head.status !== 200) ok = false
      }
    )
    return ok
  }).finally(() => {
    pipy.listen(8081, null)
  })
}
