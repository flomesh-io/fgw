var $ctx
var $resource
var $target

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .pipe(
    () => selectTarget() ? 'forward' : 'bypass',
    {
      'forward': ($=>$
        .muxHTTP(() => $resource).to($=>$
          .pipe(() => $target.connect)
        )
        .onEnd(() => $resource.free())
      ),
      'bypass': $=>$.pipeNext(),
    }
  )
)

function selectTarget() {
  $resource = loadBalancers.get($ctx.serviceConfig.Endpoints).allocate()
  if ($resource) {
    $target = $resource.target
    return true
  } else {
    return false
  }
}

var loadBalancers = new algo.Cache(
  endpoints => new algo.LoadBalancer(
    Object.entries(endpoints).map(
      ([k, v]) => {
        var connect
        if ($ctx.serviceConfig.MTLS) {
          connect = pipeline($=>$
            .dump(() => $ctx.serviceName)
            .connectTLS({
              certificate: {
                cert: new crypto.CertificateChain(v.UpstreamCert.CertChain),
                key: new crypto.PrivateKey(v.UpstreamCert.PrivateKey),
              },
              trusted: [new crypto.Certificate(v.UpstreamCert.IssuingCA)],
            }).to($=>$
              .connect(() => $target.address)
            )
          )
        } else {
          connect = v.UseSSL ? connectTLS : connectTCP
        }
        return {
          address: k,
          weight: v.Weight,
          tags: v.Tags,
          connect,
        }
      }
    ), {
      weight: t => t.weight,
    }
  )
)

var connectTCP = pipeline($=>$
  .connect(() => $target.address)
)

var connectTLS = pipeline($=>$
  .connectTLS({}).to($=>$
    .connect(() => $target.address)
  )
)
