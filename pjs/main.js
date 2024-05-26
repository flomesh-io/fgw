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
    var chain

    switch (proto) {
      case 'TCP':
        chain = [
          'http/codec.js',
          'http/route.js',
          'http/forward.js',
          'http/default.js',
        ]
        break
      case 'UDP':
        chain = []
        wireProto = 'udp'
        break
      case 'TLS':
        chain = l.TLS?.TLSModeType === 'Terminate' ?  [
          'common/tls-termination.js',
          'http/codec.js',
          'http/route.js',
          'http/forward.js',
          'http/default.js',
        ] : [
        ]
        break
      case 'HTTP':
        chain = [
          'http/codec.js',
          'http/route.js',
          'http/forward.js',
          'http/default.js',
        ]
        break
      case 'HTTPS':
        chain = [
          'common/tls-termination.js',
          'http/codec.js',
          'http/route.js',
          'http/forward.js',
          'http/default.js',
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
        $ctx = {
          config,
          listener: l,
          rules: portRules[i.localPort],
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
