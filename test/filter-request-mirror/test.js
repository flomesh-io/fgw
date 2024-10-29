export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      new Message('hi')
    )
  )

  var logs = []

  pipy.listen(8123, $=>$
    .serveHTTP(
      req => {
        log('Mirror', req.head)
        logs.push(req.head)
        return new Message
      }
    )
  )

  return Promise.all(new Array(15).fill().map(
    (_, i) => {
      return fetch('localhost:8000', 'GET', 'http://test.com/mirror').then(
        res => res?.head?.status
      )
    }
  )).then(results => {
    log('Waiting for logs...')
    return new Timeout(3).wait().then(results)
  }).then(results => {
    return (
      results.every(status => status === 200) &&
      results.length === 15 &&
      logs.length === 5 &&
      logs.every(log => log.headers.host === 'test.com' && log.path === '/mirror')
    )
  }).finally(() => {
    pipy.listen(8080, null)
    pipy.listen(8123, null)
  })
}
