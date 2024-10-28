import resources from '../resources.js'
import { findPolicies } from '../utils.js'

export default function (backendRef, backendResource, gateway) {
  var backendTLSPolicies = findPolicies('BackendTLSPolicy', backendResource)
  var tlsCertificate = gateway.spec.backendTLS?.clientCertificate
  var tlsValidationConfig = backendTLSPolicies.find(r => r.spec.validation)?.spec?.validation
  var tlsConfig = null
  if (tlsCertificate) {
    tlsConfig = tlsConfig || {}
    tlsConfig.certificate = {
      cert: new crypto.Certificate(resources.secrets[tlsCertificate['tls.crt']]),
      key: new crypto.PrivateKey(resources.secrets[tlsCertificate['tls.key']]),
    }
  }
  if (tlsValidationConfig) {
    tlsConfig = tlsConfig || {}
    tlsConfig.sni = tlsValidationConfig.hostname
    tlsConfig.trusted = tlsValidationConfig.caCertificates.map(
      c => new crypto.Certificate(
        resources.secrets[c['ca.crt']]
      )
    )
  }
  return tlsConfig
}
