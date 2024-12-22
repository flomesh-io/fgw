export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      new Message('hello')
    )
  )

  var request = (url) => {
    var u = new URL(url)
    return fetch(u.host, 'GET', url).then(
      res => {
        var status = res?.head?.status
        log('GET', url, '=>', status)
        return status
      }
    )
  }

  return request('http://localhost:8000').then(
    status => {
      return request('http://localhost:8001').then(
        status2 => {
          return status === 502 && status2 === 200
        }
      )
    }
  ).finally(() => {
    pipy.listen(8080, null)
  })
}
