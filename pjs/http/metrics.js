((
  {
    metricsCache,
    durationCache,
  } = pipy.solve('lib/metrics.js'),
) => (

pipy({
  _request: null,
  _requestTime: null
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
    _requestTime = Date.now()
  )
)
.chain()
.handleMessageStart(
  (msg) => (
    (
      serviceName = __service?.name,
      status = msg?.head?.status,
      statusClass = Math.floor(status / 100),
      metrics = metricsCache.get(serviceName),
      durationHist = durationCache.get(serviceName),
    ) => (
      durationHist && durationHist.observe(Date.now() - _requestTime),
      metrics && (
        metrics.upstreamCompletedCount.increase(),
        metrics.upstreamResponseTotal.increase(),
        status && (

          metrics.fgwHttpStatus.withLabels(
            status,
            __route?.config?.route || '',
            __route?.config?.Path?.Path || '',
            __domain?.name || '',
            __consumer?.name || '',
            __target || '',
            (_request?.head?.path || '').split('?')[0]
          ).increase(),

          metrics.upstreamCodeCount.withLabels(status).increase(),
          metrics.upstreamCodeXCount.withLabels(statusClass).increase(),
          metrics.upstreamResponseCode.withLabels(statusClass).increase()
        )
      )
    )
  )()
)

))()