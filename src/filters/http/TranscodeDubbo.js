export default function (config) {
  var conf = config.transcodeDubbo
  var version = conf.version || ''
  var service = conf.service || ''
  var method = conf.method || ''
  var signature = conf.signature || ''

  var $ctx
  var requestID = 0

  var pl = pipeline($=>$
    .onStart(c => { $ctx = c })
    .replaceMessage(
      req => {
        var json = JSON.decode(req.body)
        var params = (json instanceof Array ? json : [json])
        return new Message(
          {
            requestID: ++requestID,
          },
          Hessian.encode([
            '2.0.2', service, version, method, signature, ...params
          ]
        ))
      }
    )
    .pipeNext()
    .replaceMessage(
      res => {
        var results = Hessian.decode(res.body)
        return new Message(JSON.encode(results))
      }
    )
  )

  pl.meta = { outputProtocol: 'dubbo' }
  return pl
}
