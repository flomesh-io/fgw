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

  tls2 = {
    "Expiration": "2032-07-28 03:42:25",
    "CertChain": "-----BEGIN CERTIFICATE-----\nMIIFEjCCAvqgAwIBAgIUKDre1bsG88s52KBVSHKE4bbkDLkwDQYJKoZIhvcNAQEL\nBQAwPDEUMBIGA1UECwwLTXlSb290Q0EgUjIxETAPBgNVBAoMCE15Um9vdENBMREw\nDwYDVQQDDAhNeVJvb3RDQTAeFw0yMjA4MDIwNzA1MzJaFw0zMjA3MzAwNzA1MzJa\nMDUxCzAJBgNVBAYTAkNOMRIwEAYDVQQKDAlNeUludGVyQ0ExEjAQBgNVBAMMCU15\nSW50ZXJDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMCl19pg5Elc\nJ5SJTv4q4NazyoG9hZgOjsciwqnwovVXNQyM5dachwULZ2GeIyovoB6YhhcViM0u\nAGq802LoGK6OxrlLbxRvXohhpQhtzjKeRbfhZBhnHZEJsyFSV0EiY9b3bPUqOLHf\nk+m03gifJfFC4vQzh5EbY0pHc6PWnR5Fb8uDTUJ4mQ71lntQEHCl23ZqlCbhI2c0\ncDavueY/uaY5FUXjz28ZxWAPwVTdInzWbNgO5Rm4QHmJCswfh58wgiDZe6+kuTEd\n4AZPHigXo24I5UApkfbXBL9d1Qh/N7YP8J3I2L/+hdoZmwMZVFg07DmeDfD+LKRN\n1HkCS0nPjRgql4cpwNhaFaotHOlwZ3b+9XFFrj7PJAkFdUpVKrH4yVzyX5Tzjrcy\npAptn47XfGZC5jI0W96cCy+6t5gWEE6pvgqf5RpUhIvqaD1/Rkk16b6GDRbkZMxe\nGBurqzzVRjooddAzPeLxmsbdh7PBsIG3k7Tldwq/VZlfi1zJ5cLsUgBkJesGWYKl\ntFSTc4Ylm0oec0Lp24Hp/KV9f1Xz0uZHgFFzYvNXNvRNvzQoKxA2iDJuw20g5WvM\n7vzfVCQgBvwLEFnSiO+KHoCCKSiMS39yp9WsBgiwW1EtKg5p4EjEe1pHw67P/3wz\n6iztPxN1X6OAhJOHN9JFvEJ+MORdlJ6fAgMBAAGjEzARMA8GA1UdEwEB/wQFMAMB\nAf8wDQYJKoZIhvcNAQELBQADggIBAGtrg5bPTy4u0WZ17j6DV2eWEujMuI22/SNY\nAV5UwGRhHCm7YfeENBByl4kmRSwdzOWwYrNw6wV7sxiMyG0Fd3w4qTnjnMSuxHtu\ngMfi4zU4ZJDMBqM/iupA3JIJJjHY3aKqHS37JCaDfztdzYCtm8tfQ5D6m9M9zGQV\nmvXXLUnFEzNU0ahStPj5fDeflmJZso3Ud5khNxdWrPre3n9zD1N0vEOy6HsF3cxp\nbo4VfFFCmu0njJjfh6gscy4sSFtN/SyjJiYXC5IjKMaw9agG4itbsCCH1Ox76kzA\ntkAsxjZJTl2/gJPsCWXn5ngBpD32TLojvjym7TFRtKmlZNq0WobJTbOIJKjmlCeL\n1LKFwKUD+MY3wU6BV5Wt+nIKZu3sK7rN2vEXmgU3JYZt/2d44yL2ss41QWZ5pPW4\nlwCKTcAQ+wpHw95GcGi8zB+H4MTQdEy7345N9MSBUDKGkLLVnRTBqapF7u222Mob\nrdzkpLLaKVG0+MCYiHyUa7ExgA8ZulhK26Fue/wk6KiNjdip4gJmUbntTrReWeSV\nMbubTjhGwd+zEJrEol471Ia/2e04HAazlG9yvQf1P5XsEyFXY7ufxEkOe9Dc2G9m\nngY9KiyINasT1RCzC1FxzwGttYwZaBvqitRPGlP9P9nALcF0PfYDzydbGPuhfMLP\ncc1choUZ\n-----END CERTIFICATE-----\n",
    "PrivateKey": "-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----\n",
    "IssuingCA0": "-----BEGIN CERTIFICATE-----\nMIIFWTCCA0GgAwIBAgIUNKjLHxL3+ClJqkQ4vPWng9eF+i4wDQYJKoZIhvcNAQEL\nBQAwPDEUMBIGA1UECwwLTXlSb290Q0EgUjIxETAPBgNVBAoMCE15Um9vdENBMREw\nDwYDVQQDDAhNeVJvb3RDQTAeFw0yMjA4MDIwNjUyMDlaFw0zMjA3MzAwNjUyMDla\nMDwxFDASBgNVBAsMC015Um9vdENBIFIyMREwDwYDVQQKDAhNeVJvb3RDQTERMA8G\nA1UEAwwITXlSb290Q0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDl\nijHtCgkNwWdX/QBVcBJK/6frXbMjY5tUMaT+kpCjYraKtY53xX5DcwOOtzlmLufp\nlBsYwtgCbgV3zU87mrnyd+NkGg+bbY3YP0xMF3RTfzRixkZbGuQDo8VRHeWsnxqg\nbHQ1CPfHAvj7uND9tlwMEpowdhQJM7GMItleaLWMtkuuime1EQug4cY+NEoG5o6u\nyyfIyL6BqaMrhSMvIysCIbx/uhp8/wYDikcbglatLULxqgGu2fRjrIt6HTgz0MR5\nAvQeykHrU8sH4VL2wHnUEARJBrovoiZ8ncGUjjpalktU7/CG9jr11jNVRSJSZvFt\nd71FFuyyxfM5F/J4shleR0cVEyUtA8Wh+N0dWrI9yRgKcSGF87T1fPGsmLEu8qFq\nAzGM7ahmbCD6JshJICqKCWAuSTsM8ixHBc0kkC4hHMwBOlthzltrmBcTPY6f/V8a\nFR2d3DC9FODWqkb5S34ppqO2854TfQ++NJaHYFqkvotkze68dO39vyQrggPDheEk\nDQHx2lFNND6DX/5jUXjVjH7msgGw4kwA7qfZOaeitkFZPuLQapNetPyUffHwicFa\nPF2evvkoHNNrPkAvm5Wdr4AhBhdLrhfq7jQeBNARJtH2hcXTTSBzzXp55PMjWKTh\niYyTzXlJeQqLgcUSzYZE+f1Az96i+jWCxAj2pIUaEwIDAQABo1MwUTAdBgNVHQ4E\nFgQUquU1wQ7pcpsqdGb5v5eBkVmXlQAwHwYDVR0jBBgwFoAUquU1wQ7pcpsqdGb5\nv5eBkVmXlQAwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAgEAcqpE\n4p6+Xwgy3pIVDabZBvzvtbC505oaOs8gp0tzCPIMn1pg6ZMYziTdYKI2UfGNedFO\nd9WAxinwzDlyBDz876crxua3MKVxTBQLQtC7SPS5Jwv53HA7lGqK6MHfmdMbxo13\nM/J5SPM1kQFXjiWaW+pMQCQ6kbVe9cjo/8QXsnjbxngOpYLNnhpnoYq6Vjh9ZRl0\n8hMkt2A7ruaYl+kEH0ORpBGovsLz9QeLBQw2ZksBUACO25lZOYWVilrpd6OR27zv\nojhaNanlfTr81wZiXT5SMxA8cV1GEJHlxKVg5v291oENSHuOOIMVi7mo4ZjfVRmr\n1vckRHOFRIcYwA2lqaEmtxYyhwne1HktnTQCpw5sTpPM8ibOZyMDJ46jvsUQdvI2\nsVjG4aaEkcM1yVzX8jkZly4rGw7GPpY1hs/2X8ZMcJJ5t5t81kzfb9N/Roh6Ax33\n/yALEwCQ7WBnLLBdAp5uigwjR1e/eg2WxKtE8eTIkThaeWIHRpjngryDCKNctONZ\nL93ARMxpenag2r4uD4fZahpspf8LhwExOpcG0HjNb74YVXuylS2IJ6tENsmOPQu/\n2gyYEXhEeHBbc7M5GPv765Xctg/EWPoygl5+MwAhDgsCubwB8Dap5ciuh0fK03fs\nIhRvf3KD2ng8o/ZTJQ51jSvuuzP0oHHp/DYIadg=\n-----END CERTIFICATE-----\n",
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

.listen(8843)
.connectTLS({
  certificate: () => ({
    cert: new crypto.Certificate(tls.CertChain),
    key: new crypto.PrivateKey(tls.PrivateKey),
  }),
  ///trusted: [new crypto.Certificate(tls.IssuingCA)],
  sni: () => 'www.test.com',
  verify: (ok, cert) => (
    console.log('-------------xxxxxxx 8843,', ok, cert),
    ok
  )
}).to(
  $=>$.connect('127.0.0.1:443')
)

.listen(8844)
.connectTLS({
  certificate: () => ({
    cert: new crypto.Certificate(tls2.CertChain),
    key: new crypto.PrivateKey(tls2.PrivateKey),
  }),
  trusted: [new crypto.Certificate(tls2.IssuingCA)],
  sni: () => 'www.test.com',
  verify: (ok, cert) => (
    console.log('-------------xxxxxxx 8844,', ok, cert),
    ok
  )
}).to(
  $=>$.connect('127.0.0.1:443')
)

.listen(8845)
.demuxHTTP().to(
  $=>$.replaceMessage(
    () => (
      console.log('8845 retry times:', times),
      times++ < 0 ? (
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
  //trusted: [new crypto.Certificate(tls.IssuingCA)],
  verify: (ok, cert) => (
    console.log('-------------xxxxxxx 8849,', ok, cert),
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
        new Message({status: 200}, "www-port-8849")
      )
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
  //trusted: [new crypto.Certificate(tls.IssuingCA)],
  verify: (ok, cert) => (
    console.log('-------------xxxxxxx 8850,', ok, cert),
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

