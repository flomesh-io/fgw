((
  {
    metrics,
    metricsCache,
    durationCache,
  } = pipy.solve('lib/metrics.js'),
) => pipy()

.export('http', {
  __http: null,
})

.pipeline()
.handleStreamStart(
  () => (
    metrics.fgwHttpCurrentConnections.withLabels('accepted').increase(),
    metrics.fgwHttpCurrentConnections.withLabels('active').increase()
  )
)
.handleStreamEnd(
  () => (
    metrics.fgwHttpCurrentConnections.withLabels('handled').increase(),
    metrics.fgwHttpCurrentConnections.withLabels('active').decrease()
  )
)
.demuxHTTP().to(
  $=>$
  .handleMessageStart(
    msg => (__http = msg?.head)
  )
  .chain()
)

)()