export default function ({ fetch, log }) {
  [0, 1, 2, 3].forEach(i => pipy.listen(8080 + i, 'udp', $=>$
    .replaceData(
      new Data(`target-${i}`)
    )
  ))

  var $counter
  var $answers

  return Promise.all(
    new Array(60).fill().map(
      () => pipeline($=>$
        .onStart(() => {
          $counter = 10
          $answers = []
          return new Message('hi')
        })
        .repeat(() => new Timeout(0.1).wait().then(() => --$counter > 0)).to($=>$
          .mux({ maxIdle: 2 }).to($=>$
            .connect('localhost:8000', { protocol: 'udp' })
            .replaceData(data => new Message(data))
          )
          .replaceMessage(msg => {
            var res = msg.body.toString()
            if (!$answers.includes(res)) $answers.push(res)
            return new StreamEnd
          })
        )
        .onEnd(() => $answers)
      ).spawn()
    )
  ).then(answers => {
    if (answers.some(a => a.length !== 1)) {
      log('inconsistent responses')
      return false
    }
    answers = answers.map(a => a[0])
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
    [0, 1, 2, 3].forEach(i => pipy.listen(8080 + i, 'udp', null))
  })
}
