function startServer(indent) {
  var counter = 0
  pipy.listen(8845, $=>$
    .serveHTTP(
      () => {
        print(indent)
        println('request count', counter)
        if (counter++ < 4) {
          return new Message({ status: 503 }, "www-port-8845")
        } else {
          return new Message({ status: 200 }, "www-port-8845")
        }
      }
    )
  )
}

function stopServer() {
  pipy.listen(8845, null)
}

function request(url) {
  var u = new URL(url)
  var c = new http.Agent(u.host)
  return c.request('GET', u.path)
}

export default function () {
  var indent = ' '.repeat(4)
  var urlDirect = 'http://127.0.0.1:8845/'
  var urlProxy = 'http://127.0.0.1:8080/'

  startServer(indent)

  return Promise.resolve().then(() => {
    return request(urlDirect)
  }).then(res => {
    var status = res.head.status
    print(indent)
    println(urlDirect, status)
    if (status !== 503) return false
    return request(urlProxy)
  }).then(res => {
    var status = res.head.status
    print(indent)
    println(urlProxy, status)
    if (status !== 200) return false
    return true
  }).finally(stopServer)
}
