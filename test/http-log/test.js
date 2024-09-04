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
        if (req.head.method === 'POST' && req.head.path === '/log') {
          req.body.toString().split('\n').forEach(
            line => logs.push(JSON.parse(line))
          )
        }
      }
    )
  )

  return Promise.all(new Array(10).fill().map(
    (_, i) => {
      return fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
        res => res?.head?.status
      )
    }
  )).then(results => {
    log('Waiting for logs...')
    return new Timeout(3).wait().then(results)
  }).then(results => {
    return (
      results.every(status => status === 200) &&
      logs.length === results.length &&
      logs.every(log => log.backend === 'hello' && log.target === 'localhost:8080')
    )
  }).finally(() => {
    pipy.listen(8080, null)
    pipy.listen(8123, null)
  })
}
