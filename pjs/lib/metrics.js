(
  (
    config = pipy.solve('config.js'),

    {
      namespace,
      kind,
      name,
      pod,
    } = pipy.solve('lib/utils.js'),

    fgwHttpStatus = new stats.Counter('fgw_http_status', [
      'service', 'code', 'route', 'matched_uri', 'matched_host', 'consumer', 'node', 'path'
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

    sendBytesTotalCounter = new stats.Counter('fgw_service_upstream_cx_tx_bytes_total', [
      'fgw_service_name'
    ]),
    receiveBytesTotalCounter = new stats.Counter('fgw_service_upstream_cx_rx_bytes_total', [
      'fgw_service_name'
    ]),
    activeConnectionGauge = new stats.Gauge('fgw_service_upstream_cx_active', [
      'fgw_service_name'
    ]),
    upstreamCompletedCount = new stats.Counter('fgw_service_external_upstream_rq_completed', [
      'fgw_service_name'
    ]),
    destroyRemoteActiveCounter = new stats.Counter('fgw_service_upstream_cx_destroy_remote_with_active_rq', [
      'fgw_service_name'
    ]),
    destroyLocalActiveCounter = new stats.Counter('fgw_service_upstream_cx_destroy_local_with_active_rq', [
      'fgw_service_name'
    ]),
    connectTimeoutCounter = new stats.Counter('fgw_service_upstream_cx_connect_timeout', [
      'fgw_service_name'
    ]),
    pendingFailureEjectCounter = new stats.Counter('fgw_service_upstream_rq_pending_failure_eject', [
      'fgw_service_name'
    ]),
    pendingOverflowCounter = new stats.Counter('fgw_service_upstream_rq_pending_overflow', [
      'fgw_service_name'
    ]),
    requestTimeoutCounter = new stats.Counter('fgw_service_upstream_rq_timeout', [
      'fgw_service_name'
    ]),
    requestReceiveResetCounter = new stats.Counter('fgw_service_upstream_rq_rx_reset', [
      'fgw_service_name'
    ]),
    requestSendResetCounter = new stats.Counter('fgw_service_upstream_rq_tx_reset', [
      'fgw_service_name'
    ]),
    upstreamCodeCount = new stats.Counter('fgw_service_external_upstream_rq', [
      'fgw_service_name',
      'fgw_response_code'
    ]),
    upstreamCodeXCount = new stats.Counter('fgw_service_external_upstream_rq_xx', [
      'fgw_service_name',
      'fgw_response_code_class'
    ]),
    upstreamResponseTotal = new stats.Counter('fgw_service_upstream_rq_total', [
      'source_namespace',
      'source_workload_kind',
      'source_workload_name',
      'source_workload_pod',
      'fgw_service_name'
    ]),
    upstreamResponseCode = new stats.Counter('fgw_service_upstream_rq_xx', [
      'source_namespace',
      'source_workload_kind',
      'source_workload_name',
      'source_workload_pod',
      'fgw_service_name',
      'fgw_response_code_class'
    ]),

    fgwRequestDurationHist = new stats.Histogram('fgw_request_duration_ms', [
      5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000, 300000, 600000, 1800000, 3600000, Infinity
    ], [
      'source_namespace',
      'source_kind',
      'source_name',
      'source_pod',
      'fgw_service_name'
    ]),

    metrics = {
      fgwHttpRequestsTotal,
      fgwHttpCurrentConnections,
      fgwUpstreamStatus,
    },

    metricsCache = new algo.Cache(serviceName => (
      {
        fgwHttpStatus: fgwHttpStatus.withLabels(serviceName),
        fgwBandwidth: fgwBandwidth.withLabels(serviceName),
        fgwHttpRequestsTotal,
        fgwHttpCurrentConnections,

        sendBytesTotalCounter: sendBytesTotalCounter.withLabels(serviceName),
        receiveBytesTotalCounter: receiveBytesTotalCounter.withLabels(serviceName),
        activeConnectionGauge: activeConnectionGauge.withLabels(serviceName),
        upstreamCompletedCount: upstreamCompletedCount.withLabels(serviceName),
        destroyRemoteActiveCounter: destroyRemoteActiveCounter.withLabels(serviceName),
        destroyLocalActiveCounter: destroyLocalActiveCounter.withLabels(serviceName),
        connectTimeoutCounter: connectTimeoutCounter.withLabels(serviceName),
        pendingFailureEjectCounter: pendingFailureEjectCounter.withLabels(serviceName),
        pendingOverflowCounter: pendingOverflowCounter.withLabels(serviceName),
        requestTimeoutCounter: requestTimeoutCounter.withLabels(serviceName),
        requestReceiveResetCounter: requestReceiveResetCounter.withLabels(serviceName),
        requestSendResetCounter: requestSendResetCounter.withLabels(serviceName),
        upstreamCodeCount: upstreamCodeCount.withLabels(serviceName),
        upstreamCodeXCount: upstreamCodeXCount.withLabels(serviceName),
        upstreamResponseTotal: upstreamResponseTotal.withLabels(namespace, kind, name, pod, serviceName),
        upstreamResponseCode: upstreamResponseCode.withLabels(namespace, kind, name, pod, serviceName),
      }
    )),

    durationCache = new algo.Cache(serviceName => (
      fgwRequestDurationHist.withLabels(namespace, kind, name, pod, serviceName)
    )),

  ) => (

    Object.keys(config?.Services || {}).forEach(
      serviceName => (
        (
          metrics = metricsCache.get(serviceName),
        ) => (
          metrics.upstreamResponseTotal.zero(),
          metrics.upstreamResponseCode.withLabels('5').zero(),
          metrics.activeConnectionGauge.zero(),
          metrics.receiveBytesTotalCounter.zero(),
          metrics.sendBytesTotalCounter.zero(),
          metrics.connectTimeoutCounter.zero(),
          metrics.destroyLocalActiveCounter.zero(),
          metrics.destroyRemoteActiveCounter.zero(),
          metrics.pendingFailureEjectCounter.zero(),
          metrics.pendingOverflowCounter.zero(),
          metrics.requestTimeoutCounter.zero(),
          metrics.requestReceiveResetCounter.zero(),
          metrics.requestSendResetCounter.zero()
        )
      )()
    ),

    {
      metrics,
      metricsCache,
      durationCache,
      rateLimitCounter: new stats.Counter('http_local_rate_limiter', [
        'http_local_rate_limit'
      ]),
    }
  )

)()