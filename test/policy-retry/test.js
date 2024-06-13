export default function ({ fetch, log }) {
  var counter = 0
  pipy.listen(8080, $=>$
    .serveHTTP(
      () => {
        log('request count', counter)
        if (counter++ < 6) {
          return new Message({ status: 503 }, 'hi')
        } else {
          return new Message({ status: 200 }, 'hi')
        }
      }
    )
  )

  var host = 'localhost:8000'
  var urlA = 'http://www.test.com/no-retry'
  var urlB = 'http://www.test.com/retry'

  return Promise.resolve().then(() => {
    return fetch(host, 'GET', urlA)
  }).then(res => {
    var status = res.head.status
    log(urlA, status)
    if (status !== 503) return false
    return fetch(host, 'GET', urlB)
  }).then(res => {
    var status = res.head.status
    log(urlB, status)
    if (status !== 503) return false
    return fetch(host, 'GET', urlB)
  }).then(res => {
    var status = res.head.status
    log(urlB, status)
    if (status !== 200) return false
    return true
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
