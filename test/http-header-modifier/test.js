export default function () {
  pipy.listen(8849, $=>$
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

  var indent = ' '.repeat(4)
  var c = new http.Agent('localhost:8080')

  return c.request(
    'GET', '/', { host: 'www.test.com', 'user-agent': 'pipy' }
  ).then(res => {
    try { var req = JSON.decode(res.body) } catch {}
    res = res.head.headers
    print(indent)
    println('REQ', req)
    print(indent)
    println('RES', res)
    return (
      req.host === 'set-bar' &&
      req.accept === 'xxx' &&
      req['user-agent'] === undefined &&
      res.dummy1 === 'set-bar' &&
      res.dummy2 === 'test2,add,baz' &&
      res.dummy3 === undefined
    )
    return true
  }).finally(() => {
    pipy.listen(8849, null)
  })
}
