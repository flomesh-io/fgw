export default function (config) {
  var $ctx

  return pipeline($=>$
    .onStart(c => { $ctx = c })
    .demuxHTTP().to($=>$
      .pipe(
        function (evt) {
          if (evt instanceof MessageStart) {
            return evt.head.method === 'CONNECT' ? 'tunnel' : 'forward'
          }
        }, {
          'tunnel': ($=>$
            .acceptHTTPTunnel(
              function (req) {
                $ctx.originalTarget = req.head.path
                return new Message({ status: 200 })
              }
            ).to($=>$.pipeNext())
          ),
          'forward': ($=>$
            .handleMessageStart(
              function (req) {
                var url = new URL(req.head.path)
                $ctx.originalTarget = `${url.hostname}:${url.port}`
                req.head.path = url.path
              }
            )
            .pipeNext()
          ),
        }
      )
    )
  )
}
