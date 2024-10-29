export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      () => new Timeout(5).wait().then(
        new Message('hi')
      )
    )
  )

  var host = 'localhost:8000'
  var urlA = 'http://www.test.com/no-timeout'
  var urlB = 'http://www.test.com/timeout'

  return Promise.resolve().then(() => {
    return fetch(host, 'GET', urlA)
  }).then(res => {
    var status = res.head.status
    log(urlA, status)
    if (status !== 200) return false
    return fetch(host, 'GET', urlB)
  }).then(res => {
    if (!res) return false
    var status = res.head.status
    log(urlB, status)
    if (status !== 504) return false
    return true
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
