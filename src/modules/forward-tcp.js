var $ctx
var $target

export default pipeline($=>$
  .onStart(c => void ($ctx = c))
  .wait(() => findTarget())
  .connect(() => $target)
)

function findTarget() {
  var hostConfig = $ctx.hostConfig
  if (!hostConfig) return false

  if (typeof hostConfig === 'string') {
    $target = hostConfig
    if ($target.indexOf(':') < 0) {
      $target += ':' + ($ctx.config.Configs.DefaultPassthroughUpstreamPort || 443)
    }
    console.log($target)
    return true
  }

  return false
}
