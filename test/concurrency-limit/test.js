export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      () => new Timeout(3).wait().then(
        new Message('hello')
      )
    )
  )

  var requests = () => Promise.all(new Array(3).fill().map(
    (_, i) => {
      return fetch(
        'localhost:8000', 'GET', 'http://localhost:8000', {}, null, null, { idleTimeout: 5 }
      ).then(
        res => {
          var status = res?.head?.status
          log('Request', i, '=>', status)
          return status
        }
      )
    }
  ))

  return requests().then(results => {
    log('Wait for 8 seconds...')
    return new Timeout(8).wait().then(
      () => requests().then(results2 => {
        return (
          results[0] === 200 &&
          results[1] === 200 &&
          results[2] === 502 &&
          results2[0] === 200 &&
          results2[1] === 200 &&
          results2[2] === 502
        )
      })
    )
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
