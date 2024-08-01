export default function ({ log, fetchAll }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      new Message('hi')
    )
  )

  var $response

  var testSOCKS = pipeline($=>$
    .onStart(new Message({ headers: { host: 'localhost' }}))
    .muxHTTP().to($=>$
      .connectSOCKS(() => '127.0.0.1:8080').to($=>$
        .connect('localhost:9090')
      )
    )
    .replaceMessage(msg => {
      $response = msg
      return new StreamEnd
    })
    .onEnd(() => $response)
  )

  var testHTTP = pipeline($=>$
    .onStart(new Message({ headers: { host: 'localhost' }}))
    .muxHTTP().to($=>$
      .connectHTTPTunnel(
        () => new Message({
          method: 'CONNECT',
          path: 'localhost:8080',
        })
      ).to($=>$
        .muxHTTP().to($=>$
          .connect('localhost:9090')
        )
      )
    )
    .replaceMessage(msg => {
      $response = msg
      return new StreamEnd
    })
    .onEnd(() => $response)
  )

  return Promise.all([
    testSOCKS.spawn(),
    testHTTP.spawn(),
  ]).then(responses => {
    var ok = responses.map(r => (
      r && r.head &&
      r.head.status === 200 &&
      r.body.toString() === 'hi'
    ))
    log(ok[0] ? 'PASS' : 'FAIL', 'Proxy via SOCKS')
    log(ok[1] ? 'PASS' : 'FAIL', 'Proxy via HTTP')
    return ok[0] && ok[1]
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
