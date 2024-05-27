var $ctx
var $hello = false

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .handleTLSClientHello(findHost)
  .pipeNext()
)

function findHost(hello) {
  var sni = hello.serverNames[0] || ''
  var hostConfig = $ctx.hostRouter(sni)
  $ctx.serverName = sni
  $hello = true
}
