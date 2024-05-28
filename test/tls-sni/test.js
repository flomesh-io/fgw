function connect(target, sni, expected) {
  var resolve
  var reject

  pipeline($=>$
    .onStart(new Data)
    .connectTLS({
      sni,
      onState: session => {
        switch (session.state) {
          case 'connected': return check(session.peer)
          case 'closed': return reject(session.error)
        }
      }
    }).to($=>$
      .connect(target, {
        onState: conn => {
          if (conn.state === 'closed') {
            reject('connection closed')
          }
        }
      })
    )
  ).spawn()

  function check(cert) {
    if (cert.subject.commonName === expected) resolve(expected)
    if (cert.subjectAltNames.includes(expected)) resolve(expected)
    reject(`expected name '${expected} not found`)
  }

  return new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
}

export default function () {
  var indent = ' '.repeat(4)
  return Promise.all([
    connect('127.0.0.1:8443', 'www.aaa.com', 'MyInterCA'),
    connect('127.0.0.1:8443', 'a.b.example.com', 'a.b.example.com'),
    connect('127.0.0.1:8443', 'www.test.com', '*.test.com'),
  ]).then(results => {
    results.forEach(
      name => {
        print(indent)
        println(name)
      }
    )
    return true
  }).catch(err => {
    print(indent)
    println(err)
    return false
  })
}
