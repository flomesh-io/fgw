export default function ({ log }) {
  pipy.listen(5553, 'udp', $=>$
    .replaceData(
      data => {
        var q = DNS.decode(data)
        return DNS.encode({
          id: q.id,
          qr: 1,
          rd: 1,
          ra: 1,
          question: q.question,
          answer: [{
            name: 'bing.com',
            type: 'A',
            ttl: 3600,
            rdata: '5.6.7.8',
          }]
        })
      }
    )
  )

  return Promise.all(
    [
      { q: 'bing.com', a: '5.6.7.8' },
      { q: 'google.com', a: '1.2.3.4' },
      { q: 'x.com', a: '0.0.0.0' },
    ].map(t => {
      var $answer
      return pipeline($=>$
        .onStart(() => DNS.encode({
          id: 1,
          rd: 1,
          question: [{ name: t.q, type: 'A' }]
        }))
        .connect('localhost:5555', { protocol: 'udp' })
        .replaceData(
          data => {
            try {
              $answer = DNS.decode(data).answer[0].rdata
            } catch {}
            return new StreamEnd
          }
        )
        .onEnd(() => $answer)
      ).spawn().then(a => {
        log(a === t.a ? 'OK' : 'ERROR', 'Q =', t.q, '; A =', a || '?')
        return (a === t.a)
      })
    })
  ).then(
    results =>!results.some(r => !r)
  ).finally(
    () => pipy.listen(5553, 'udp', null)
  )
}
