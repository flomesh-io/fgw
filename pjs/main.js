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

var portRules = {}

Object.entries(config.RouteRules).forEach(
  ([ports, rules]) => {
    ports.split(',').forEach(
      port => portRules[port.trim()] = rules
    )
  }
)

var pidFilename = config.Configs?.PidFile
if (pidFilename) {
  os.write(pidFilename, pipy.pid.toString())

  pipy.exit(
    function () {
      os.unlink(pidFilename)
    }
  )
}

var $ctx

config.Listeners?.forEach?.(
  function (l) {
    var port = l.Listen || l.Port
    if (!port) return

    var proto = l.Protocol
    var wireProto = 'tcp'
    var chains = config.Chains
    var chain

    switch (proto) {
      case 'TCP':
        chain = chains?.TCPRoute
        break
      case 'UDP':
        chain = chains?.UDPRoute
        wireProto = 'udp'
        break
      case 'TLS':
        chain = chains?.[l.TLS?.TLSModeType === 'Terminate' ?  'TLSTerminate' : 'TLSPassthrough']
        break
      case 'HTTP':
        chain = chains?.HTTPRoute
        break
      case 'HTTPS':
        chain = chains?.HTTPSRoute
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
        $ctx = {
          config,
          listener: l,
          rules: portRules[i.localPort],
        }
        return new Data
      })
      .pipe(chain, () => $ctx)
    )
  }
)
