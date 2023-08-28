(
  (
    config = pipy.solve('config.js'),

    fgwHttpStatus = new stats.Counter('fgw_http_status', [
      'service', 'code', 'route', 'matched_uri', 'matched_host', 'consumer', 'node'
    ]),

    fgwBandwidth = new stats.Counter('fgw_bandwidth', [
      'service', 'type', 'route', 'consumer', 'node'
    ]),

    fgwHttpRequestsTotal = new stats.Gauge('fgw_http_requests_total'),

    fgwHttpCurrentConnections = new stats.Gauge('fgw_http_current_connections', [
      'state'
    ]),

    fgwUpstreamStatus = new stats.Gauge('fgw_upstream_status', [
      'name', 'ip', 'port'
    ]),

    fgwHttpLatency = new stats.Histogram('fgw_http_latency', [
      1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000, 300000, 600000, 1800000, 3600000, Infinity
    ], [
      'service',
      'route',
      'consumer',
      'type',
      'node'
    ]),

    sendBytesTotalCounter = new stats.Counter('fgw_upstream_tx_bytes_total', [
      'service'
    ]),

    receiveBytesTotalCounter = new stats.Counter('fgw_upstream_rx_bytes_total', [
      'service'
    ]),

    activeConnectionGauge = new stats.Gauge('fgw_upstream_connection_active', [
      'service'
    ]),

    metrics = {
      fgwHttpRequestsTotal, // codec.js
      fgwHttpCurrentConnections, // codec.js
      fgwUpstreamStatus, // health-check.js
    },

    metricsCache = new algo.Cache(serviceName => (
      {
        fgwHttpStatus: fgwHttpStatus.withLabels(serviceName), // metrics.js
        fgwBandwidth: fgwBandwidth.withLabels(serviceName), // metrics.js
        fgwHttpLatency: fgwHttpLatency.withLabels(serviceName), // metrics.js
        sendBytesTotalCounter: sendBytesTotalCounter.withLabels(serviceName), // connect-tcp.js
        receiveBytesTotalCounter: receiveBytesTotalCounter.withLabels(serviceName), // connect-tcp.js
        activeConnectionGauge: activeConnectionGauge.withLabels(serviceName), // connect-tcp.js
      }
    )),

  ) => (

    Object.keys(config?.Services || {}).forEach(
      serviceName => (
        (
          metrics = metricsCache.get(serviceName),
        ) => (
          metrics.activeConnectionGauge.zero(),
          metrics.receiveBytesTotalCounter.zero(),
          metrics.sendBytesTotalCounter.zero()
        )
      )()
    ),

    {
      metrics,
      metricsCache,
      rateLimitCounter: new stats.Counter('http_local_rate_limiter', [
        'http_local_rate_limit'
      ]),
    }
  )

)()