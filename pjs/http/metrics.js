((
  {
    metrics,
    metricsCache,
    durationCache,
  } = pipy.solve('lib/metrics.js'),
) => (

pipy({
  _request: null,
  _requestTime: null,
  _requestSize: 0,
  _metrics: null,
})

.import({
  __domain: 'route',
  __route: 'route',
  __service: 'service',
  __target: 'connect-tcp',
  __consumer: 'consumer',
})

.pipeline()
.handleMessageStart(
  (msg) => (
    _request = msg,
    // add HTTP header size
    _requestTime = Date.now(),
    metrics.fgwHttpRequestsTotal.increase()
  )
)
.handleData(
  data => (
    _requestSize += data.size
  )
)
.chain()
.handleMessageStart(
  (msg) => (
    (
      serviceName = __service?.name,
      status = msg?.head?.status,
      statusClass = Math.floor(status / 100),
      durationHist = durationCache.get(serviceName),
    ) => (
      durationHist && durationHist.observe(Date.now() - _requestTime),
      _metrics = metricsCache.get(serviceName),
      _metrics && (

        _metrics.upstreamCompletedCount.increase(),
        _metrics.upstreamResponseTotal.increase(),
        status && (

          _metrics.fgwHttpStatus.withLabels(
            status,
            __route?.config?.route || '',
            __route?.config?.Path?.Path || '',
            __domain?.name || '',
            __consumer?.name || '',
            __target || '',
            (_request?.head?.path || '').split('?')[0]
          ).increase(),

          _metrics.fgwBandwidth.withLabels(
            'egress',
            __route?.config?.route || '',
            __consumer?.name || '',
            __inbound.remoteAddress || ''
          ).increase(_requestSize),
          _requestSize = 0,
          // add HTTP header size

          _metrics.upstreamCodeCount.withLabels(status).increase(),
          _metrics.upstreamCodeXCount.withLabels(statusClass).increase(),
          _metrics.upstreamResponseCode.withLabels(statusClass).increase()
        )
      )
    )
  )()
)
.handleData(
  data => (
    _metrics && _metrics.fgwBandwidth.withLabels(
      'ingress',
      __route?.config?.route || '',
      __consumer?.name || '',
      __inbound.remoteAddress || ''
    ).increase(data.size)
  )
)

))()