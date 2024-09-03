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
          log(i, 'status', status, 'latency', latency)
          return { status, latency }
        }
      )
    }
  )).then(results => {
    return (
      results[0].status === 200 &&
      results[1].status === 200 &&
      results[2].status === 200 && results[2].latency > 500 &&
      results[3].status === 200 && results[3].latency > 500 &&
      results[4].status === 200 && results[4].latency > 500 &&
      results[5].status === 429 &&
      results[6].status === 429 &&
      results[7].status === 429 &&
      results[8].status === 429 &&
      results[9].status === 429
    )
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
