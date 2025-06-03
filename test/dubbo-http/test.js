export default function ({ fetch, log }) {
  pipy.listen(20880, $=>$
    .decodeDubbo()
    .replaceMessage(
      req => {
        var params = Hessian.decode(req.body).slice(5)
        return new Message(
          req.head,
          Hessian.encode(params)
        )
      }
    )
    .encodeDubbo()
  )

  return fetch(
    'localhost:8080', 'GET', 'http://test.com/user', {},
    JSON.encode(['hello', 'dubbo'])
  ).then(
    res => {
      try {
        var status = res?.head?.status
        var body = JSON.decode(res.body)
      } catch {}
      log(status, body)
      return (
        status === 200 &&
        body?.[0] === 'hello' &&
        body?.[1] === 'dubbo'
      )
    }
  ).finally(() => {
    pipy.listen(20880, null)
  })
}
