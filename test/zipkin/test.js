export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      req => new Message(JSON.encode(req.head.headers))
    )
  )

  return Promise.all(new Array(10).fill().map(
    (_, i) => {
      return fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
        res => {
          var status = res?.head?.status
          try {
            var headers = JSON.decode(res.body)
          } catch {}
          log(i, 'status', status, 'headers', headers)
          return { status, headers }
        }
      )
    }
  )).then(results => {
    return (
      results.every(({ status }) => status === 200) &&
      results.every(({ headers }) => headers['x-b3-traceid']?.length === 32) &&
      results.every(({ headers }) => headers['x-b3-spanid']?.length === 16) &&
      results.filter(({ headers }) => headers['x-b3-sampled'] === '1').length === 2
    )
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
