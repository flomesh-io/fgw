import { config } from '../config.js'

var fgwMetaInfo = new stats.Gauge('fgw_meta_info', [
  'uuid',
  'name',
  'codeBase',
  'k8sCluster'
])

var fgwResourceUsage = new stats.Gauge('fgw_resource_usage', [
  'uuid',
  'name',
  'codeBase',
  'host',
  'type'
])

var fgwHttpStatus = new stats.Counter('fgw_http_status', [
  'service', 'code', 'route', 'matched_uri', 'matched_host', 'consumer', 'node'
])

var fgwBandwidth = new stats.Counter('fgw_bandwidth', [
  'service', 'type', 'route', 'consumer', 'node'
])

var fgwHttpRequestsTotal = new stats.Gauge('fgw_http_requests_total')

var fgwHttpCurrentConnections = new stats.Gauge('fgw_http_current_connections', [
  'state'
])

var fgwUpstreamStatus = new stats.Gauge('fgw_upstream_status', [
  'name', 'ip', 'port', 'type', 'http_status', 'changed'
])

var fgwHttpLatency = new stats.Histogram('fgw_http_latency', [
  1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000, 300000, 600000, 1800000, 3600000, Infinity
], [
  'service',
  'route',
  'consumer',
  'type',
  'node'
])

var sendBytesTotalCounter = new stats.Counter('fgw_upstream_tx_bytes_total', [
  'service'
])

var receiveBytesTotalCounter = new stats.Counter('fgw_upstream_rx_bytes_total', [
  'service'
])

var activeConnectionGauge = new stats.Gauge('fgw_upstream_connection_active', [
  'service'
])

var fgwStreamConnectionTotal = new stats.Counter('fgw_stream_connection_total', [
  'route'
])

export var metrics = {
  fgwMetaInfo, // main.js
  fgwResourceUsage, // resource-usage.js
  fgwHttpRequestsTotal, // codec.js
  fgwHttpCurrentConnections, // codec.js
  fgwUpstreamStatus, // health-check.js
  fgwStreamConnectionTotal, // connect-tcp.js
}

export var metricsCache = new algo.Cache(serviceName => (
  {
    fgwHttpStatus: fgwHttpStatus.withLabels(serviceName), // metrics.js
    fgwBandwidth: fgwBandwidth.withLabels(serviceName), // metrics.js
    fgwHttpLatency: fgwHttpLatency.withLabels(serviceName), // metrics.js
    sendBytesTotalCounter: sendBytesTotalCounter.withLabels(serviceName), // connect-tcp.js
    receiveBytesTotalCounter: receiveBytesTotalCounter.withLabels(serviceName), // connect-tcp.js
    activeConnectionGauge: activeConnectionGauge.withLabels(serviceName), // connect-tcp.js
  }
))

Object.keys(config?.Services || {}).forEach(
  serviceName => {
    var metrics = metricsCache.get(serviceName)
    metrics.activeConnectionGauge.zero()
    metrics.receiveBytesTotalCounter.zero()
    metrics.sendBytesTotalCounter.zero()
  }
)

export var rateLimitCounter = new stats.Counter('http_local_rate_limiter', [
  'http_local_rate_limit'
])

export var aclCounter = new stats.Counter('access_control', [
  'type'
])
