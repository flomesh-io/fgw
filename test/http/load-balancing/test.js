function startServer() {
  pipy.listen(8886, $=>$
    .serveHTTP(
      new Message('www-port-8886')
    )
  )

  pipy.listen(8887, $=>$
    .serveHTTP(
      new Message('www-port-8887')
    )
  )

  pipy.listen(8888, $=>$
    .serveHTTP(
      new Message('www-port-8888')
    )
  )

  pipy.listen(8889, $=>$
    .serveHTTP(
      new Message('www-port-8889')
    )
  )
}

function stopServer() {
  pipy.listen(8886, null)
  pipy.listen(8887, null)
  pipy.listen(8888, null)
  pipy.listen(8889, null)
}

export default function () {
  startServer()

  var c = new http.Agent('127.0.0.1:8080')

  var answers = []

  function step() {
    if (answers.length === 99) {
      stopServer()
      var ok = true
      var total = 0
      var expected = Math.floor(answers.length / 3)
      var indent = ' '.repeat(4)
      ;['www-port-8886', 'www-port-8887', 'www-port-8888'].forEach(
        s => {
          var n = answers.filter(i => i === s).length
          print(indent)
          println(s, '=', n)
          if (Math.abs(n - expected) > 1) ok = false
          total += n
        }
      )
      print(indent)
      println('total =', total)
      if (total !== answers.length) ok = false
      return ok
    }

    return c.request('GET', '/').then(
      res => {
        answers.push(res.body.toString())
        return step()
      }
    )
  }

  return step()
}
