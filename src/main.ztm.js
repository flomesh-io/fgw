import resources from './resources.js'
import { logEnable } from './utils.js'
import { startGateway, makeResourceWatcher } from './startup.js'

export default function ({ mesh, app, utils }) {
  logEnable(true)

  resources.initZTM(
    { mesh, app },
    makeResourceWatcher(isLocalGateway)
  ).then(() => {
    resources.list('Gateway').forEach(gw => {
      if (!gw.metadata?.name) return
      if (isLocalGateway(gw)) startGateway(gw)
    })
  })

  function isLocalGateway(gw) {
    var endpoints = gw.spec?.ztm?.endpoints
    if (endpoints instanceof Array) {
      var id = app.endpoint.id
      var name = app.endpoint.name
      return endpoints.some(ep => ep.id === id || ep.name === name)
    }
    return false
  }

  var $ctx

  var serveUser = utils.createServer({})

  var servePeer = utils.createServer({})

  return pipeline($=>$
    .onStart(c => void ($ctx = c))
    .pipe(() => {
      switch ($ctx.source) {
        case 'user': return serveUser
        case 'peer': return servePeer
      }
    })
  )
}
