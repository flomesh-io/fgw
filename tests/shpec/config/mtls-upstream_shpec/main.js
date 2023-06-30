
((
  data = new Data(),
  size = 0,
  times = 0,


  tls =
    {
      "CertChain": "-----BEGIN CERTIFICATE-----\nMIIE2jCCAsKgAwIBAgIUIlymLJWoz8TNR+lX1H4cMIVAkJQwDQYJKoZIhvcNAQEL\nBQAwfjELMAkGA1UEBhMCQ04xCzAJBgNVBAgMAkdEMQswCQYDVQQHDAJHWjEQMA4G\nA1UECgwHZmxvbWVzaDEMMAoGA1UECwwDciZkMRQwEgYDVQQDDAtleGFtcGxlLmNv\nbTEfMB0GCSqGSIb3DQEJARYQYWRtaW5AZmxvbWVzaC5pbzAeFw0yMzA2MTYwMTA0\nMjdaFw0yNTA5MTgwMTA0MjdaMHkxCzAJBgNVBAYTAkNOMQswCQYDVQQIDAJHRDEL\nMAkGA1UEBwwCR1oxEDAOBgNVBAoMB2Zsb21lc2gxDDAKBgNVBAsMA2RldjEYMBYG\nA1UEAwwPYS5iLmV4YW1wbGUuY29tMRYwFAYJKoZIhvcNAQkBFgdhQGIuY29tMIIB\nIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0+UKQnLbe80F9273U40O9Fus\njpgzQfUL9S+Y4w0FYWY7c9aeAqhW0Z+4qFADN6ZA3t0xJ0AbG6RE/wXiZJxweL3W\ntusRaBTFVtkfb37vSCz2Bh/EoiyWVHuTtfH6XYobGTjZE2wKcdpt+TZ0Rb42cT5K\nhKBRW4kg6LKX1wXQK2IX9rlAGgyV3k/S/r03cTqHGB0xoEhBkyvN4nzvGuIFZXXo\nYggs8T63aQJSa0sJj6vvWMsAGbjY5xd02Tth70JqrKPO1iDvEKmv665GgzCpBXSZ\nt/8J6EGTKr1vyGZcX8K6Z0IB+9i51OL01Z6FQ3z4eL5bTVSuOo995AC7TPfmawID\nAQABo1UwUzAfBgNVHSMEGDAWgBSbaW0un1RHQscHyyEZ1bTkGvPCQTAJBgNVHRME\nAjAAMAsGA1UdDwQEAwIE8DAYBgNVHREEETAPgg1oZWxsZmlzaC50ZXN0MA0GCSqG\nSIb3DQEBCwUAA4ICAQAQWS8J7qstNZi+FSzgjZ8/dm3UqmX7No4NsKPpnl+/uF/f\nBZ2X6HrdqvuQHuzsyIwZAkEJh59hEk/hr1wfFWjP2QbY2QsOjG1W+8eBopu0GQPD\n2kL+MMuBf9mDEtOlUxVh8/OtmymfCDQiVqzLcZbrlJGemJovK1YMGCHNhRTLnNht\nU2wL37e0/4c74Yqb/k+yRvRITUB9sHyMpXUR9vI1SurWC+BH0VaO3d+X7TvGGdCR\nK1Y4an2NaIoLTSC0e5SigHHrVV8tvym3s+/Qar1n3NayQEPaHeSklXm8d4SVsH1w\nlMsQN+gmNhWr1qt5/ZTVINBm07mX+LSbb1JuYQor3ZjPwKKzyDC41OAGOQvfsAjl\nqaAWIR0xUXa6H1V/SEw2pUYuDiXKe8sioo1mIcNPKk3iO0Rk/k3YSOft5ueVhIpf\ntE5FJ8x1aNqIWrwVbgbh6tS1qDpmdwsLt0tQw/OfyBw64wlag1tTIT63B4zkkV3P\nDRHMxDobzpJszWZeuq5ZQFfibJxs52kxL6jxiKbm0JcFPz0gPX0bwSpej3DVi489\nuOJBwRuK2S9RdtpOUwTEVlAvAB3RI0ePdWWTAgNMrB+dXEqxvMhbJsyagSy4oYPe\nwx/yUjCgJNO50MiD/MuNm2lOwGvt+1RGUp8CCoogxTiV00Dx8RQQ+ABh6aJqmA==\n-----END CERTIFICATE-----\n",
      "PrivateKey": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0+UKQnLbe80F9273U40O9FusjpgzQfUL9S+Y4w0FYWY7c9ae\nAqhW0Z+4qFADN6ZA3t0xJ0AbG6RE/wXiZJxweL3WtusRaBTFVtkfb37vSCz2Bh/E\noiyWVHuTtfH6XYobGTjZE2wKcdpt+TZ0Rb42cT5KhKBRW4kg6LKX1wXQK2IX9rlA\nGgyV3k/S/r03cTqHGB0xoEhBkyvN4nzvGuIFZXXoYggs8T63aQJSa0sJj6vvWMsA\nGbjY5xd02Tth70JqrKPO1iDvEKmv665GgzCpBXSZt/8J6EGTKr1vyGZcX8K6Z0IB\n+9i51OL01Z6FQ3z4eL5bTVSuOo995AC7TPfmawIDAQABAoIBABg10zZEaU973XKn\n+xpQw6Sn1M92FGU02mjpR06p7jNyuthBbUxgb4sD9NVGTxfMpxzPqQ4TBQXjfv6k\nbXmRZkhlaGL9+L8roGCL7kuO9UgJ2xJYDt94uLRuajIfs7t8TBxVonfVoFvh2S7g\nSeiuEwpdU6ZTqvgKcvgjb7XhtCdAmMHRBrBo2czMuhcw9Gf8ZpgmV6f59HteX8uS\nhiCNwTrosDV7pclzExcrtlOGcx1OIWArmsabvNmBZ0b6vT5EN7JuMrrj797KNb2O\npbOhE79Qj4l1qBd27GvNrMdYaxeKMC5rOyssSnPa9WKPERg9gqDKCbXDC9U8TT1T\nl5iJNAECgYEA7HEBHaoeyUL5Jzc4mGGLnsrBUcXRU5Aqd8CHLcNcQvdMJ0tXNsCA\n50AKL6nlZ8Lnb2GasuZV3FZFbBXDn1GERRnxshBl6zMMV9x36KGHNE+N+XscKnFw\nYmgAPvKhuwD4neZJ+rR5GkQq26XOzaUKLgElAEU16zDZIloMgu5B2IkCgYEA5Ww4\n8BA31+aaQ7a67PpSgvM1Cx/hK6RGbMRXnJZLtzGnL6WaJicjrM0c3vPU/qm3arC6\nUgxTjVf9xKXcQ/MGse1MMT98Scof7JSITnzH1hCOmMi+K5jD7e6zmSRcEYIqHvHP\nONZvS1Is16Fv3ajjpmw50TFBt0SC2qmm7HfYolMCgYEAsfLq0BS1Tuwk8KrS4Xyo\nxD38+TpUrPuXusEf/AVIbu4IVpqRbRe87E56XB0WFt3NqTpgX7yTal1TqmFG9aU4\nU3mPOmC1FCs7YvT/GgpX47rsM5PAQwFVf/qeFMIvjrrQYqZrj1A8xNQBHYbQ+lz4\nKF+cJXPxfK0q/nufZvtCe2ECgYAtZYS+u/bQ2eicjYPfcIjzMHzGfsBnilIFI7TS\nX0sMLN8QJoyiEAyXHN8hns3+tkZ87gtwQNAnn8mvJ8K2D1i7zGDPPeiyETTP83Ql\nU7uXOB9/S/mVVt0uL5WKMA+nx0Hebaq7bHMJTHFjGaaxDcI+JBwssLp4MS5TZk6J\nbA2J0QKBgG76Z4mXWwZ3sIN3ESOjjn0Oizb7CFdESFMs00ivhC/Ar3NcJeV1tx82\nqEhMJkjGnmljVOfMe/QbUVpP9jtVsFj0bKyQR1hWrkwRuya4y3aSF6JbbL9jp52l\ngsNXPunZoLBQrhaSqCFtIo0IK/IePX4HouNeU8xT/nsJDBgvfTSA\n-----END RSA PRIVATE KEY-----\n",
      "IssuingCA": "-----BEGIN CERTIFICATE-----\n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\nhYlG4D2T1laFcnkQ1jNcri0=\n-----END CERTIFICATE-----\n"
    },

) => pipy({
})

.task()
.onStart(
  () => new Data
)
.replay().to(
  $=>$.replaceStreamStart(
    () => (
      size < 1000000 ? (
         data.push('0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'),
         size += 100,
         new StreamEnd('Replay')
      ) : (
        new StreamEnd
      )
    )
  )
)

.listen(8844)
.demuxHTTP().to(
  $=>$
  .handleMessage(
    () => new Timeout(1).wait()
  )
  .replaceMessage(
    () => (
      new Message({status: 200}, "www-port-8844")
    )
  )
)

.listen(8845)
.demuxHTTP().to(
  $=>$.replaceMessage(
    () => (
      console.log('8845 retry times:', times),
      times++ < 3 ? (
        new Message({status: 503}, "www-port-8845")
      ) : (
        new Message({status: 200}, "www-port-8845")
      )
    )
  )
)

.listen(8846)
.demuxHTTP().to(
  $=>$.replaceMessage(
    () => (
      new Message({status: 200}, "www-port-8846")
    )
  )
)

.listen(8847)
.demuxHTTP().to(
  $=>$.replaceMessage(
    () => (
      new Message({status: 200}, "www-port-8847")
    )
  )
)

.listen(8848)
.demuxHTTP().to(
  $=>$.replaceMessage(
    () => (
      new Message({status: 200}, "www-port-8848")
    )
  )
)

.listen(8849)
.demuxHTTP().to(
  $=>$.replaceMessage(
    msg => (
      new Message({status: 200, headers: {dummy1: 'test1', dummy2: 'test2', dummy3: 'test3'}}, JSON.stringify(msg.head, null, 2) + "\r\nwww-port-8849")
    )
  )
)

.listen(8850)
// .dump('8089')
.acceptTLS({
  certificate: (sni, cert) => (
  console.log('0client request sni:', sni),
  console.log('0client request cert:', cert),
  {
    cert: new crypto.Certificate(tls.CertChain),
    key: new crypto.PrivateKey(tls.PrivateKey),
  }),
  sni: (name) => (
    console.log('1client request tls name:', name)
  ),
  trusted: [new crypto.Certificate(tls.IssuingCA)],
  verify: (ok, cert) => (
    console.log('-------------xxxxxxx 8089,', ok, cert),
    ok
  ),
  alpn: names => (
    console.log('2alpn test:', ((names.indexOf('h2')+1) || (names.indexOf('http/1.1')+1)) - 1),
    console.log('2alpn names:', names),
    ((names.indexOf('h2')+1) || (names.indexOf('http/1.1')+1)) - 1
  )
}).to(
  $=>$
  .demuxHTTP().to(
    $=>$.replaceMessage(
      () => (
        new Message({status: 200}, "www-port-8850")
      )
    )
  )
)

)()


