export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      req => new Message(
        {
          status: 200,
          headers: {
            dummy1: 'test1',
            dummy2: 'test2',
            dummy3: 'test3',
          }
        },
        JSON.encode(req.head.headers)
      )
    )
  )

  return fetch(
    'localhost:8000', 'GET', 'http://www.test.com/', { 'user-agent': 'pipy' }
  ).then(res => {
    try { var req = JSON.decode(res.body) } catch {}
    res = res.head.headers
    log('REQ', req)
    log('RES', res)
    return (
      req.host === 'set-bar' &&
      req.accept === 'xxx' &&
      req['user-agent'] === undefined &&
      res.dummy1 === 'set-bar' &&
      res.dummy2 === 'test2,add,baz' &&
      res.dummy3 === undefined
    )
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
