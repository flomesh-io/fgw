export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      new Message('hello')
    )
  )

  function isSuccess(result) {
    return result.status === 200 && result.latency < 100
  }

  function isDelayed(result) {
    return result.status === 200 && result.latency > 500
  }

  function isRejected(result) {
    return result.status === 429 && result.latency < 100
  }

  return Promise.all(new Array(10).fill().map(
    (_, i) => {
      return new Timeout(0.01*i).wait().then(() => {
        var t0 = Date.now()
        return fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
          res => {
            var status = res?.head?.status
            var latency = Date.now() - t0
            log(i, 'status', status, 'latency', latency)
            return { status, latency }
          }
        )
      })
    }
  )).then(results => {
    return (
      isSuccess(results[0]) &&
      isSuccess(results[1]) &&
      isDelayed(results[2]) &&
      isDelayed(results[3]) &&
      isDelayed(results[4]) &&
      isDelayed(results[5]) &&
      isDelayed(results[6]) &&
      isRejected(results[7]) &&
      isRejected(results[8]) &&
      isRejected(results[9])
    )
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
