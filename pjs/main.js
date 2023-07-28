((
  { config } = pipy.solve('config.js'),
  listeners = {},
  listenPort = 0,
) => pipy()

.export('listener', {
  __port: null,
})

.repeat(
  (config.Listeners || []),
  ($, l)=>$.listen(
    (listenPort = (l.Listen || l.Port || 0), listeners[listenPort] = new ListenerArray, listeners[listenPort].add(listenPort), listeners[listenPort]),
    { ...l, protocol: (l?.Protocol === 'UDP') ? 'udp' : 'tcp' }
  )
  .onStart(
    () => (
      __port = l,
      new Data
    )
  )
  .link('launch')
)

.pipeline('launch')
.branch(
  () => (__port?.Protocol === 'HTTP'), (
    $=>$.chain(config?.Chains?.HTTPRoute || [])
  ),
  () => (__port?.Protocol === 'HTTPS'), (
    $=>$.chain(config?.Chains?.HTTPSRoute || [])
  ),
  () => (__port?.Protocol === 'TLS' && __port?.TLS?.TLSModeType === 'Passthrough'), (
    $=>$.chain(config?.Chains?.TLSPassthrough || [])
  ),
  () => (__port?.Protocol === 'TLS' && __port?.TLS?.TLSModeType === 'Terminate'), (
    $=>$.chain(config?.Chains?.TLSTerminate || [])
  ),
  () => (__port?.Protocol === 'TCP'), (
    $=>$.chain(config?.Chains?.TCPRoute || [])
  ),
  (
    $=>$.replaceStreamStart(new StreamEnd)
  )
)

.task()
.onStart(new Data)
.use('common/health-check.js')

)()
