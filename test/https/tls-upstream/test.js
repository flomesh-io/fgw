function startServer() {
  var key = new crypto.PrivateKey({ type: 'rsa', bits: 2048 })
  var cert = new crypto.Certificate({
    subject: { CN: 'pipy.flomesh.io' },
    privateKey: key,
    publicKey: new crypto.PublicKey(key),
  })

  pipy.listen(8443, $=>$
    .acceptTLS({
      certificate: { cert, key }
    }).to($=>$
      .serveHTTP(
        new Message('hi')
      )
    )
  )
}

function stopServer() {
  pipy.listen(8443, null)
}

export default function () {
  startServer()

  var c = new http.Agent('localhost:8080')

  return c.request('GET', '/').then(
    res => {
      return res.head.status === 200 && res.body.toString() === 'hi'
    }
  ).catch(() => {
    return false
  }).finally(() => {
    stopServer()
  })
}
