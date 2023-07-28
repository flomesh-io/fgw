pipy()

.export('http', {
  __http: null,
})

.pipeline()
.demuxHTTP().to(
  $=>$
  .handleMessageStart(
    msg => (__http = msg?.head)
  )
  .chain()
)