var $ctx
var $hello = false

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .handleTLSClientHello(findCertificate)
  .pipe(
    () => {
      if ($hello) {
        return $ctx.serverCert ? 'pass' : 'deny'
      }
    }, {
      'pass': ($=>$
        .acceptTLS({
          certificate: () => $ctx.serverCert,
          onState: session => {
            if (session.state === 'connected') {
              $ctx.clientCert = session.peer
            }
          }
        }).to($=>$.pipeNext())
      ),
      'deny': $=>$.replaceStreamStart(new StreamEnd)
    }
  )
)

var defaultCertificates = new algo.Cache(
  function (config) {
    var crt = config.Certificate?.CertChain
    var key = config.Certificate?.PrivateKey
    if (crt && key) {
      return {
        cert: new crypto.Certificate(crt),
        key: new crypto.PrivateKey(key),
      }
    }
    return null
  }
)

var certificateFinders = new algo.Cache(
  function (listener) {
    var fullnames = {}
    var postfixed = []
    if (listener.TLS?.Certificates) {
      listener.TLS.Certificates.forEach(
        c => {
          var cert = new crypto.Certificate(c.CertChain)
          var key = new crypto.PrivateKey(c.PrivateKey)
          var tls = { cert, key }
          ;[cert.subject.commonName, ...cert.subjectAltNames].forEach(
            n => {
              if (n.startsWith('*')) {
                postfixed.push([n.substring(1), tls])
              } else {
                fullnames[n] = tls
              }
            }
          )
        }
      )
    }
    return function (sni) {
      sni = sni.toLowerCase()
      return (
        fullnames[sni] ||
        postfixed.find(([postfix]) => sni.endsWith(postfix))?.[1]
      )
    }
  }
)

function findCertificate(hello) {
  var sni = hello.serverNames[0] || ''
  var cert = (
    certificateFinders.get($ctx.listener)(sni) ||
    defaultCertificates.get($ctx.config)
  )
  $ctx.serverName = sni
  $ctx.serverCert = cert || null
  $hello = true
}
