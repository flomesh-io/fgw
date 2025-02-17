export default function ({ log }) {
  [1, 2].forEach(i => {
    pipy.listen(8080 + i, $=>$
      .decodeDubbo()
      .replaceMessage(
        (req) => new Message(
          req.head,
          Hessian.encode([`test-svc-${i}`])
        )
      )
      .encodeDubbo()
    )
  })

  var requests = [
    ['org.apache.dubbo.sample.UserProvider', 'v1', 'getUser', 'I', 'test-svc-1'],
    ['org.apache.dubbo.sample.UserProvider', 'v2', 'getUser', 'I', 'test-svc-2'],
    ['org.apache.dubbo.sample.UserProvider', 'v1', 'setUser', 'I', 'test-svc-2'],
  ]

  var $ok = false

  return Promise.all(
    requests.map(([service, version, method, signature, response]) => (
      pipeline($=>$
        .onStart(new Message({}, Hessian.encode(['2.0.2', service, version, method, signature])))
        .encodeDubbo()
        .connect('localhost:8080')
        .decodeDubbo()
        .replaceMessage(
          msg => {
            var result = Hessian.decode(msg.body)
            log(result)
            $ok = true
            return new StreamEnd
          }
        )
        .onEnd(() => $ok)
      ).spawn()
    ))
  ).then(
    results => !results.some(r => !r)
  ).finally(() => {
    [1, 2].forEach(i => pipy.listen(8080 + i, null))
  })
}
