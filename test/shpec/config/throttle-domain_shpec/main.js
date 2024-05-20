
((
  data = new Data(),
  size = 0,
  times = 0,
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

)()



