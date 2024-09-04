export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      () => new Timeout(0.5).wait().then(new Message('hello'))
    )
  )

  return Promise.all(new Array(10).fill().map(
    (_, i) => {
      return new Timeout(i * 1).wait().then(
        () => fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
          res => {
            var status = res?.head?.status
            log(i, 'status', status)
            return status
          }
        )
      )
    }
  )).then(results => {
    return (
      results[0] === 200 &&
      results[1] === 200 &&
      results[2] === 200 &&
      results[3] === 429 &&
      results[6] === 200 &&
      results[9] === 429
    )
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
