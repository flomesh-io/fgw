import { log } from '../log.js'

var $ctx
var $hello = false

export default function (config, listener) {
  var fullnames = {}
  var postfixes = []

  listener.tls?.certificates?.forEach?.(c => {
    var crtFile = config.secrets[c['tls.crt']]
    var keyFile = config.secrets[c['tls.key']]
    var crt = new crypto.Certificate(crtFile)
    var key = new crypto.PrivateKey(keyFile)
    var certificate = { cert: crt, key }
    ;[crt.subject.commonName, ... crt.subjectAltNames].forEach(
      n => {
        if (n.startsWith('*')) {
          postfixes.push([n.substring(1).toLowerCase(), certificate])
        } else {
          fullnames[n.toLowerCase()] = certificate
        }
      }
    )
  })

  function findCertificate(hello) {
    var sni = hello.serverNames?.[0] || ''
    var name = sni.toLowerCase()
    var certificate = fullnames[name] || postfixes.find(([postfix]) => name.endsWith(postfix))?.[1]
    $ctx.serverName = sni
    $ctx.serverCert = certificate || null
    $hello = true
    log?.(
      `In #${$ctx.inbound.id}`,
      `sni ${sni} cert`, $ctx.serverCert?.cert?.subject || null
    )
  }

  return pipeline($=>$
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
}

/*
pipeline($=>$
  .onStart(c => void ($ctx = c))
  .handleTLSClientHello(findCertificate)
  .pipe(() => {
    if ($hello) {
      if ($ctx.serverCert) {
        return tlsServerPipelines.get($ctx.listenerConfig)
      } else {
        return shutdown
      }
    }
  })
)

var tlsServerPipelines = new algo.Cache(
  listenerConfig => pipeline($=>$
    .acceptTLS({
      certificate: () => $ctx.serverCert,
      onState: session => {
        if (session.state === 'connected') {
          $ctx.clientCert = session.peer
        }
      },
      trusted: listenerConfig.TLS?.MTLS ? (
        listenerConfig.TLS.CACerts?.map?.(
          pem => new crypto.Certificate(pem)
        )
      ) : null,
    }).to($=>$.pipeNext())
  )
)

var shutdown = pipeline($=>$.replaceStreamStart(new StreamEnd))

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
  function (listenerConfig) {
    var fullnames = {}
    var postfixed = []
    if (listenerConfig.TLS?.Certificates) {
      listenerConfig.TLS.Certificates.forEach(
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
  var sni = hello.serverNames?.[0] || ''
  var cert = (
    certificateFinders.get($ctx.listenerConfig)(sni) ||
    defaultCertificates.get($ctx.config)
  )
  $ctx.serverName = sni
  $ctx.serverCert = cert || null
  $hello = true
}
*/
