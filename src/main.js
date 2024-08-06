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

var currentListeners = []

resources.list('Gateway').forEach(gw => {
  if (!gw.metadata?.name) return
  gw.spec.listeners.forEach(l => {
    try {
      var listenerKey = makeListener(gw, l)
      if (!currentListeners.some(k => isIdentical(k, listenerKey))) {
        currentListeners.push(listenerKey)
      }
    } catch (err) {
      console.error(err)
    }
  })
})

function makeListener(gateway, listener) {
  var key = makeListenerKey(listener)
  var port = key[0]
  var wireProto = key[1]
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
    default: throw `Listener: unknown protocol '${listener.protocol}'`
  }

  var routeResources = findRouteResources(gateway, listener)
  var routerKey = [gateway.metadata.name, ...key]
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

  var $ctx

  pipy.listen(port, wireProto, $=>$
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

  log?.(`Start listening on ${wireProto} port ${port}`)
  return key
}

function makeListenerKey(listener) {
  var address = listener.address || '0.0.0.0'
  var port = listener.port
  var protocol = (listener.protocol === 'UDP' ? 'udp' : 'tcp')
  return [`${address}:${port}`, protocol]
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

var dirtyGateways = []
var dirtyRouters = []
var dirtyBackends = []
var dirtyTimeout = null

function onResourceChange(newResource, oldResource) {
  var res = newResource || oldResource
  var kind = res.kind
  var newName = newResource?.metadata?.name
  var oldName = oldResource?.metadata?.name
  switch (kind) {
    case 'Gateway':
      if (newName) addDirtyGateway(newName)
      if (oldName) addDirtyGateway(oldName)
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
      break
    case 'Backend':
      if (newName) addDirtyBackend(newName)
      if (oldName) addDirtyBackend(oldName)
      break
  }
  if (dirtyTimeout) dirtyTimeout.cancel()
  dirtyTimeout = new Timeout(5)
  dirtyTimeout.wait().then(updateDirtyResources)
}

function addDirtyGateway(name) {
  if (!dirtyGateways.includes(name)) {
    dirtyGateways.push(name)
    dirtyRouters = dirtyRouters.filter(
      ([kind, nm]) => (kind !== 'Gateway' || nm !== name)
    )
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

function addDirtyBackend(name) {
  if (!dirtyBackends.includes(name)) {
    dirtyBackends.push(name)
  }
}

function updateDirtyResources() {
  var gateways = resources.list('Gateway')

  dirtyBackends.forEach(
    backendName => {
      var updater = resources.getUpdater(backendName)
      if (updater) {
        updater()
        log?.(`Updated backend '${backendName}'`)
      }
    }
  )

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
      var listenerKey = makeListenerKey(l)
      var routerKey = [gw.metadata.name, ...listenerKey]
      var routeResources = findRouteResources(gw, l)
      var updater = resources.getUpdater(routerKey)
      if (updater) {
        updater(l, routeResources)
        log?.(`Updated router for gateway '${gw.metadata.name}' ${listenerKey[1]} port ${listenerKey[0]}`)
      }
    }
  )

  if (dirtyGateways.length > 0) {
    var updatedListeners = []
    gateways.forEach(gw => {
      var name = gw.metadata?.name
      if (name) {
        var isUpdated = dirtyGateways.includes(name)
        gw.spec.listeners.forEach(l => {
          try {
            var listenerKey = isUpdated ? makeListener(gw, l) : makeListenerKey(l)
            if (!updatedListeners.some(k => isIdentical(k, listenerKey))) {
              updatedListeners.push(listenerKey)
            }
          } catch (err) {
            console.error(err)
          }
        })
      }
    })
    currentListeners.forEach(
      listenerKey => {
        if (!updatedListeners.some(k => isIdentical(k, listenerKey))) {
          var port = listenerKey[0]
          var protocol = listenerKey[1]
          pipy.listen(port, protocol, null)
          log?.(`Stop listening on ${protocol} port ${port}`)
        }
      }
    )
    currentListeners = updatedListeners
  }

  dirtyGateways = []
  dirtyRouters = []
  dirtyBackends = []
}
