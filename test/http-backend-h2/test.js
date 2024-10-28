export default function ({ fetchAll, log }) {
  pipy.listen(8080, $=>$
    .serveHTTP(
      msg => new Message(msg.head.authority ? 'HTTP/2' : 'HTTP/1')
    )
  )

  return fetchAll(
    'localhost:8000',
    new Array(60).fill().map(
      () => ['GET', 'http://test.com/']
    )
  ).then(answers => answers.map(res => res.body?.toString?.())
  ).then(answers => {
    var ok = true
    var total = 0
    var half = Math.floor(answers.length / 2)
    ;[
      ['HTTP/1', half],
      ['HTTP/2', half],
    ].forEach(
      ([answer, expected]) => {
        var n = answers.filter(i => i === answer).length
        log(answer, '=', n)
        if (Math.abs(n - expected) > 1) ok = false
        total += n
      }
    )
    log('total =', total)
    if (total !== answers.length) ok = false
    return ok
  }).finally(() => {
    pipy.listen(8080, null)
  })
}
