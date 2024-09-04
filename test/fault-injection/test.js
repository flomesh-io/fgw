export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      new Message('hello')
    )
  )

  return Promise.all(new Array(10).fill().map(
    (_, i) => {
      var t0 = Date.now()
      return fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
        res => {
          var status = res?.head?.status
          var latency = Date.now() - t0
          return { status, latency }
        }
      )
    }
  )).then(results => {
    results.forEach(({ status, latency }, i) => log(i, 'status', status, 'latency', latency))
    var aborted = results.filter(r => r.status !== 200).length
    var delayed = results.filter(r => r.latency > 1000).length
    return (aborted === 2 && delayed === 5)
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
