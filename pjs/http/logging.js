((
  {
    loggingEnabled,
    makeLoggingData,
    saveLoggingData,
    makeAccessLog,
    printAccessLog,
  } = pipy.solve('lib/logging.js'),
  sampledCounter0 = new stats.Counter('inbound_http_logging_sampled_0'),
  sampledCounter1 = new stats.Counter('inbound_http_logging_sampled_1'),
) => (

pipy({
  _loggingData: null,
  _accessLogData: null
})

.import({
  __service: 'service',
  __target: 'connect-tcp',
})

.pipeline()
.handleMessage(
  (msg) => (
    loggingEnabled && (
      _loggingData = makeLoggingData(msg, __inbound.remoteAddress, __inbound.remotePort, __inbound.destinationAddress, __inbound.destinationPort),
      _loggingData ? sampledCounter1.increase() : sampledCounter0.increase()
    ),
    _accessLogData = makeAccessLog(msg, __inbound.remoteAddress, __inbound.remotePort, __inbound.destinationAddress, __inbound.destinationPort)
  )
)
.chain()
.handleMessage(
  msg => (
    loggingEnabled && _loggingData && (
      saveLoggingData(_loggingData, msg, __service?.name, __target)
    ),
    _accessLogData && (
      printAccessLog(_accessLogData, msg, __service?.name, __target)
    )
  )
)

))()