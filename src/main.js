import options from './options.js'

var opts = options(pipy.argv, {
  defaults: {
    '--config': '',
  },
  shorthands: {
    '-c': '--config',
  },
})

var configFilename = opts['--config']
var config = JSON.decode(
  configFilename
    ? os.read(configFilename)
    : pipy.load('config.json')
)

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

    switch (proto) {
      case 'TCP':
        chain = []
        break
      case 'UDP':
        chain = []
        wireProto = 'udp'
        break
      case 'TLS':
        chain = l.TLS?.TLSModeType === 'Terminate' ?  [
          'modules/terminate-tls.js',
          'modules/route-http.js',
          'modules/forward-http.js',
        ] : [
          'modules/route-tls.js',
          'modules/forward-tcp.js',
        ]
        break
      case 'HTTP':
        chain = [
          'modules/route-http.js',
          'modules/forward-http.js',
        ]
        break
      case 'HTTPS':
        chain = [
          'modules/terminate-tls.js',
          'modules/route-http.js',
          'modules/forward-http.js',
        ]
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
          hostRouter: hostRouters.get(portConfig),
          hostConfig: null,
          serverName: '',
          serverCert: null,
          clientCert: null,
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
    ([names, rules]) => (
      names.split(',').forEach(
        name => {
          name = name.trim().toLowerCase()
          if (name.startsWith('*')) {
            postfixes.push([name.substring(1), rules])
          } else {
            fullnames[name] = rules
          }
        }
      )
    )
  )
  return function (name) {
    name = name.toLowerCase()
    var rules = fullnames[name]
    if (rules) return rules
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
