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
export var config = JSON.decode(
  configFilename
    ? os.read(configFilename)
    : pipy.load('config.json')
)

var routeRules = {}

Object.entries(config.RouteRules).forEach(
  ([ports, rules]) => {
    var hostRules = {}
    Object.entries(rules).forEach(
      ([hosts, rule]) => (
        hosts.split(',').forEach(
          host => (
            hostRules[host.trim()] = rule
          )
        )
      )
    )
    ports.split(',').forEach(
      port => routeRules[port.trim()] = hostRules
    )
    routeRules[ports] = hostRules
  }
)

config.RouteRules = routeRules

export var isDebugEnabled = Boolean(config.Configs?.EnableDebug)

var socketTimeout = config.Configs?.SocketTimeout
export var socketTimeoutOptions = socketTimeout <= 0 ? {} : {
  connectTimeout: socketTimeout,
  readTimeout: socketTimeout,
  writeTimeout: socketTimeout,
  idleTimeout: socketTimeout,
}

// ((
//   config = JSON.decode(pipy.load('config.json')),
//   routeRules = {},
//   hostRules = null,
// ) => (
//   Object.keys(config?.RouteRules || {}).forEach(
//     ports => (
//       hostRules = {},
//       Object.keys(config.RouteRules[ports] || {}).forEach(
//         hosts => (
//           hosts.split(',').forEach(
//             host => (hostRules[host.trim()] = config.RouteRules[ports][hosts])
//           )
//         )
//       ),
//       config.RouteRules[ports] = hostRules
//     )
//   ),
//   Object.keys(config?.RouteRules || {}).forEach(
//     ports => (
//       ports.split(',').forEach(
//         port => (routeRules[port.trim()] = config.RouteRules[ports])
//       )
//     )
//   ),
//   config.RouteRules = routeRules,
//   {
//     config,
//     isDebugEnabled: Boolean(config?.Configs?.EnableDebug),
//     socketTimeoutOptions: (config?.Configs?.SocketTimeout > 0) ? (
//       {
//         connectTimeout: config.Configs.SocketTimeout,
//         readTimeout: config.Configs.SocketTimeout,
//         writeTimeout: config.Configs.SocketTimeout,
//         idleTimeout: config.Configs.SocketTimeout,
//       }
//     ) : {},
//   }
// ))()