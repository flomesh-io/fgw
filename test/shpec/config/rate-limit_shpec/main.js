((
  data = new Data(),
  size = 0,
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

.listen(8848)
.demuxHTTP().to(
  $=>$.replaceMessage(
    () => (
      new Message({status: 200}, data)
    )
  )
)

)()


