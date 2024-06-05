((
  { isDebugEnabled, socketTimeoutOptions } = pipy.solve('config.js'),
  { metrics, metricsCache } = pipy.solve('lib/metrics.js'),
) => (

pipy({
  _metrics: null,
  _requestTime: null,
})

.export('connect-tcp', {
  __target: null,
  __metricLabel: null,
  __upstreamError: null,
})

.pipeline()
.onStart(
  () => void (
    _metrics = metricsCache.get(__metricLabel),
    _metrics.activeConnectionGauge.increase(),
    metrics.fgwStreamConnectionTotal.withLabels(__metricLabel).increase()
  )
)
.onEnd(
  () => void (
    _metrics.activeConnectionGauge.decrease()
  )
)
.branch(
  isDebugEnabled, (
    $=>$
    .handleStreamStart(
      () => (
        console.log('[connect-tcp] metrics, target :', __metricLabel, __target),
        _requestTime = Date.now() * 1000
      )
    )
  )
)
.handleData(
  data => (
    _metrics.sendBytesTotalCounter.increase(data.size)
  )
)
.connect(() => __target, socketTimeoutOptions)
.handleStreamEnd(
  e => (
    e.error && (
      __upstreamError = e.error,
      console.log('[connect-tcp] target, error :',  __target, e.error)
    ),
    _requestTime && (
      console.log('[connect-tcp] target, response time :',  __target, Date.now() * 1000 - _requestTime)
    )
  )
)
.handleData(
  data => (
    _metrics.receiveBytesTotalCounter.increase(data.size)
  )
)

))()