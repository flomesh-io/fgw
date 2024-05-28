var $ctx
var $hello = false

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .handleTLSClientHello(findHost)
  .wait(() => $hello)
  .pipe(() => $ctx.hostConfig ? 'pass' : 'deny', {
    'pass': $=>$.pipeNext(),
    'deny': $=>$.replaceStreamStart(new StreamEnd)
  })
)

function findHost(hello) {
  var sni = hello.serverNames[0] || ''
  $ctx.hostConfig = $ctx.hostRouter(sni)
  $ctx.serverName = sni
  $hello = true
}
