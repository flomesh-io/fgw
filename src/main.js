#!/usr/bin/env -S pipy --args

import options from './options.js'
import resources from './resources.js'
import { isIdentical, log, logEnable, makeFilters } from './utils.js'

var opts = options(pipy.argv, {
  defaults: {
    '--config': '',
    '--watch': false,
    '--debug': false,
  },
  shorthands: {
    '-c': '--config',
    '-w': '--watch',
    '-d': '--debug',
  },
})

logEnable(opts['--debug'])
resources.init(opts['--config'], opts['--watch'] ? onResourceChange : null)

var $ctx

resources.list('Gateway').forEach(gw => {
  if (!gw.metadata?.name) return

  gw.spec.listeners.forEach(l => {
    var wireProto = l.protocol === 'UDP' ? 'udp' : 'tcp'
    var pipelines = makeListenerPipelines(gw, l, wireProto)

    pipy.listen(l.port, wireProto, $=>$
      .onStart(i => {
        $ctx = {
          inbound: i,
          originalTarget: undefined,
          originalServerName: undefined,
          messageCount: 0,
          serverName: undefined,
          serverCert: null,
          clientCert: null,
          backendResource: null,
        }
        log?.(`Inb #${i.id} accepted on [${i.localAddress}]:${i.localPort} from [${i.remoteAddress}]:${i.remotePort}`)
        return new Data
      })
      .pipe(pipelines, () => $ctx)
    )

    log?.(`Listening ${l.protocol} on ${l.port}`)
  })
})

function makeListenerPipelines(gateway, listener, wireProto) {
  var routeModuleName
  var termTLS = false

  switch (listener.protocol) {
    case 'HTTP':
      routeModuleName = './modules/router-http.js'
      break
    case 'HTTPS':
      routeModuleName = './modules/router-http.js'
      termTLS = true
      break
    case 'TLS':
      switch (listener.tls?.mode) {
        case 'Terminate':
          routeModuleName = './modules/router-tcp.js'
          termTLS = true
          break
        case 'Passthrough':
          routeModuleName = './modules/router-tls.js'
          break
        default: throw `Listener: unknown TLS mode '${listener.tls?.mode}'`
      }
      break
    case 'TCP':
      routeModuleName = './modules/router-tcp.js'
      break
    case 'UDP':
      routeModuleName = './modules/router-udp.js'
      break
    default: throw `Listener: unknown protocol '${l.protocol}'`
  }

  var routeResources = findRouteResources(gateway, listener)

  var routerKey = [gateway.metadata.name, listener.address, listener.port, listener.protocol]
  var pipelines = [pipy.import(routeModuleName).default(routerKey, listener, routeResources)]

  if (termTLS) {
    pipelines.unshift(
      pipy.import('./modules/terminate-tls.js').default(listener)
    )
  }

  if (listener.filters) {
    pipelines = [
      ...makeFilters(wireProto, listener.filters),
      ...pipelines,
    ]
  }

  return pipelines
}

function findRouteResources(gateway, listener) {
  var routeKinds = []
  switch (listener.protocol) {
    case 'HTTP':
    case 'HTTPS':
      routeKinds.push('HTTPRoute', 'GRPCRoute')
      break
    case 'TLS':
      switch (listener.tls?.mode) {
        case 'Terminate':
          routeKinds.push('TCPRoute')
          break
        case 'Passthrough':
          routeKinds.push('TLSRoute')
          break
      }
      break
    case 'TCP':
      routeKinds.push('TCPRoute')
      break
    case 'UDP':
      routeKinds.push('UDPRoute')
      break
  }

  return routeKinds.flatMap(kind => resources.list(kind)).filter(
    r => {
      var refs = r.spec?.parentRefs
      if (refs instanceof Array) {
        if (refs.some(
          r => {
            if (r.kind && r.kind !== 'Gateway') return false
            if (r.name !== gateway.metadata.name) return false
            if (r.sectionName === listener.name && listener.name) return true
            if (r.port == listener.port) return true
            return false
          }
        )) return true
      }
      return false
    }
  )
}

var dirtyRouters = []
var dirtyBackends = []
var dirtyTimeout = null

function onResourceChange(newResource, oldResource) {
  var res = newResource || oldResource
  var kind = res.kind
  var name = res.metadata?.name
  switch (kind) {
    case 'Gateway':
      break
    case 'HTTPRoute':
    case 'GRPCRoute':
    case 'TCPRoute':
    case 'TLSRoute':
    case 'UDPRoute':
      addDirtyRouters(res.spec?.parentRefs)
      if (oldResource && res !== oldResource) {
        addDirtyRouters(oldResource.spec?.parentRefs)
      }
      scheduleResourceUpdate()
      break
    case 'Backend':
      if (name) {
        if (!dirtyBackends.includes(name)) {
          dirtyBackends.push(name)
        }
        scheduleResourceUpdate()
      }
      break
  }
}

function addDirtyRouters(refs) {
  if (refs instanceof Array) {
    refs.forEach(ref => {
      var key = [ref.kind, ref.name, ref.port, ref.sectionName]
      if (!dirtyRouters.some(k => isIdentical(k, key))) {
        dirtyRouters.push(key)
      }
    })
  }
}

function scheduleResourceUpdate() {
  if (dirtyTimeout) dirtyTimeout.cancel()
  dirtyTimeout = new Timeout(5)
  dirtyTimeout.wait().then(updateDirtyResources)
}

function updateDirtyResources() {
  dirtyBackends.forEach(
    backendName => {
      var updaters = resources.getUpdaters(backendName)
      updaters.forEach(f => f())
      log?.(`Updated backend '${backendName}'`)
    }
  )

  var gateways = resources.list('Gateway')

  dirtyRouters.forEach(
    ([kind, name, port, sectionName]) => {
      if (kind !== 'Gateway') return
      var gw = gateways.find(gw => gw.metadata?.name === name)
      var l = gw?.spec?.listeners?.find?.(
        l => {
          if (l.name === sectionName && sectionName) return true
          if (l.port === port) return true
          return false
        }
      )
      if (!l) return
      var routerKey = [gw.metadata.name, l.address, l.port, l.protocol]
      var routeResources = findRouteResources(gw, l)
      var updaters = resources.getUpdaters(routerKey)
      updaters.forEach(f => f(l, routeResources))
      log?.(`Updated router for gateway '${gw.metadata.name}' port ${l.port} protocol ${l.protocol}`)
    }
  )

  dirtyBackends = []
}
