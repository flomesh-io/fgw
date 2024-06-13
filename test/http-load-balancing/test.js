export default function ({ fetchAll, log }) {
  [0, 1, 2, 3].forEach(i => pipy.listen(8080 + i, $=>$
    .serveHTTP(
      new Message(`target-${i}`)
    )
  ))

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
    var halfThird = Math.floor(half / 3)
    ;[
      ['target-0', half],
      ['target-1', halfThird],
      ['target-2', halfThird],
      ['target-3', halfThird],
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
    [0, 1, 2, 3].forEach(i => pipy.listen(8080 + i, null))
  })
}
