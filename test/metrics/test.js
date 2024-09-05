export default function ({ fetch, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      () => new Timeout(5).wait().then(
        new Message('hello')
      )
    )
  )

  function hasValue(lines, name, value) {
    return lines.some(
      line => {
        if (!line.startsWith(name)) return false
        var i = line.lastIndexOf(' ')
        var n = Number.parseFloat(line.substring(i + 1))
        return n === value
      }
    )
  }

  function checkValues(lines, name, check) {
    return lines.every(
      line => {
        if (!line.startsWith(name)) return true
        var i = line.lastIndexOf(' ')
        var n = Number.parseFloat(line.substring(i + 1))
        return check(n)
      }
    )
  }

  return fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
    () => Promise.all(new Array(10).fill().map(
      () => fetch('localhost:8000', 'GET', 'http://localhost:8000')
    ))
  ).then(
    () => fetch('localhost:6060', 'GET', 'http://localhost:6060/metrics')
  ).then(
    res => {
      var lines = res.body.toString().split('\n').filter(
        line => (
          line.startsWith('fgw_backend_connection_total') ||
          line.startsWith('fgw_http_request_total') ||
          line.startsWith('fgw_http_status') ||
          line.startsWith('fgw_http_latency_bucket') ||
          line.startsWith('fgw_http_latency_count') ||
          line.startsWith('fgw_bandwidth')
        )
      )
      lines.forEach(
        line => log(line)
      )
      return (
        hasValue(lines, 'fgw_backend_connection_total', 10) &&
        hasValue(lines, 'fgw_http_request_total', 11) &&
        hasValue(lines, 'fgw_http_status', 11) &&
        hasValue(lines, 'fgw_http_latency_bucket', 11) &&
        hasValue(lines, 'fgw_http_latency_count', 11) &&
        checkValues(lines, 'fgw_bandwidth', n => n > 500)
      )
    }
  ).finally(() => {
    pipy.listen(8080, null)
  })
}
