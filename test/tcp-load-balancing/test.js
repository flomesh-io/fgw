function startServer() {
  [8846, 8847, 8848, 8850].forEach(
    port => {
      pipy.listen(port, $=>$
        .serveHTTP(
          new Message(`www-port-${port}`)
        )
      )
    }
  )
}

function stopServer() {
  [8846, 8847, 8848, 8850].forEach(
    port => pipy.listen(port, null)
  )
}

export default function () {
  startServer()

  var indent = ' '.repeat(4)

  return Promise.all(
    new Array(60).fill().map(() => {
      var c = new http.Agent('127.0.0.1:2000')
      return c.request('GET', '/').catch(e => e)
    })
  ).then(answers => answers.map(res => res.body?.toString?.())
  ).then(answers => {
    var ok = true
    var total = 0
    var half = Math.floor(answers.length / 2)
    var halfThird = Math.floor(half / 3)
    ;[
      ['www-port-8846', halfThird],
      ['www-port-8847', halfThird],
      ['www-port-8848', halfThird],
      ['www-port-8850', half]
    ].forEach(
      ([answer, expected]) => {
        var n = answers.filter(i => i === answer).length
        print(indent)
        println(answer, '=', n)
        if (Math.abs(n - expected) > 1) ok = false
        total += n
      }
    )
    print(indent)
    println('total =', total)
    if (total !== answers.length) ok = false
    return ok
  }).catch(err => {
    print(indent)
    println(err)
    return false
  }).finally(stopServer)
}
