((
  {
    metricsCache,
    durationCache,
  } = pipy.solve('lib/metrics.js'),
) => (

pipy({
  _requestTime: null
})

.import({
  __service: 'service'
})

.pipeline()
.handleMessageStart(
  () => (
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
          metrics.upstreamCodeCount.withLabels(status).increase(),
          metrics.upstreamCodeXCount.withLabels(statusClass).increase(),
          metrics.upstreamResponseCode.withLabels(statusClass).increase()
        )
      )
    )
  )()
)

))()