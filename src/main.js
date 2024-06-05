import config from './config.js'

var portConfigs = makePortMap()
var hostRouters = new algo.Cache(makeHostRouter)

var $ctx

config.Listeners?.forEach?.(
  function (l) {
    var port = l.Listen || l.Port
    if (!port) return

    var proto = l.Protocol
    var wireProto = 'tcp'
    var chain
    var hasRouter = false

    switch (proto) {
      case 'TCP':
        chain = [
          'modules/route-tcp.js',
        ]
        break
      case 'UDP':
        chain = []
        wireProto = 'udp'
        break
      case 'TLS':
        if (l.TLS?.TLSModeType === 'Terminate') {
          chain = [
            'modules/terminate-tls.js',
            'modules/route-http.js',
          ]
        } else {
          chain = [
            'modules/route-tls.js',
          ]
        }
        hasRouter = true
        break
      case 'HTTP':
        chain = [
          'modules/route-http.js',
        ]
        hasRouter = true
        break
      case 'HTTPS':
        chain = [
          'modules/terminate-tls.js',
          'modules/route-http.js',
        ]
        hasRouter = true
        break
      default: throw `Unknown protocol '${proto}'`
    }

    chain = chain || []
    chain = chain.map(filename => pipy.import('./' + filename).default)

    var timeout = config.Configs?.SocketTimeout
    var options = timeout <= 0 ? {} : {
      connectTimeout: timeout,
      readTimeout: timeout,
      writeTimeout: timeout,
      idleTimeout: timeout,
    }

    pipy.listen(port, wireProto, options, $=>$
      .onStart(i => {
        var portConfig = portConfigs[i.localPort]
        $ctx = {
          config,
          listenerConfig: l,
          portConfig,
          hostRouter: hasRouter ? hostRouters.get(portConfig) : null,
          hostConfig: null,
          serverName: '',
          serverCert: null,
          clientCert: null,
          serviceName: '',
          serviceConfig: null,
        }
        return new Data
      })
      .pipe(chain, () => $ctx)
    )
  }
)

function makePortMap() {
  var map = {}
  Object.entries(config.RouteRules).forEach(
    ([ports, rules]) => {
      ports.split(',').forEach(
        port => map[port.trim()] = rules
      )
    }
  )
  return map
}

function makeHostRouter(portConfig) {
  var fullnames = {}
  var postfixes = []
  Object.entries(portConfig).forEach(
    ([names, hostConfig]) => {
      names.split(',').forEach(
        name => {
          name = name.trim().toLowerCase()
          if (name.startsWith('*')) {
            postfixes.push([name.substring(1), hostConfig])
          } else {
            fullnames[name] = hostConfig
          }
        }
      )
    }
  )
  return function (name) {
    name = name.toLowerCase()
    var hostConfig = fullnames[name]
    if (hostConfig) return hostConfig
    return postfixes.find(
      ([postfix]) => name.endsWith(postfix)
    )?.[1]
  }
}

var pidFilename = config.Configs?.PidFile
if (pidFilename) {
  os.write(pidFilename, pipy.pid.toString())
  pipy.exit(
    function () {
      os.unlink(pidFilename)
    }
  )
}
