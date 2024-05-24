import { metrics } from '../lib/metrics.js'

// ((
//   { metrics } = pipy.solve('lib/metrics.js'),
//   acceptedMetric = metrics.fgwHttpCurrentConnections.withLabels('accepted'),
//   activeMetric = metrics.fgwHttpCurrentConnections.withLabels('active'),
//   handledMetric = metrics.fgwHttpCurrentConnections.withLabels('handled'),
//   fgwHttpRequestsTotal = metrics.fgwHttpRequestsTotal,

// ) => pipy()

// .export('http', {
//   __http: null,
//   __requestHead: null,
//   __requestTail: null,
//   __requestTime: null,
//   __responseHead: null,
//   __responseTail: null,
// })

// .pipeline()
// .handleStreamStart(
//   () => (
//     acceptedMetric.increase(),
//     activeMetric.increase()
//   )
// )
// .handleStreamEnd(
//   () => (
//     handledMetric.increase(),
//     activeMetric.decrease()
//   )
// )
// .demuxHTTP().to(
//   $=>$
//   .handleMessageStart(
//     msg => (
//       __http = msg.head,
//       __requestHead = msg.head,
//       __requestTime = Date.now(),
//       fgwHttpRequestsTotal.increase()
//     )
//   )
//   .handleMessageEnd(
//     msg => __requestTail = msg.tail
//   )
//   .chain()
// )

// )()

var $ctx
var $parentCtx

export default pipeline($=>$
  .onStart(
    function (ctx) {
      $parentCtx = ctx
    }
  )
  .demuxHTTP().to($=>$
    .handleMessageStart(
      function (msg) {
        $ctx = {
          parent: $parentCtx,
          head: msg.head,
          headTime: Date.now(),
          tail: null,
          tailTime: 0,
          response: {
            head: null,
            headTime: 0,
            tail: null,
            tailTime: 0,
          },
          route: null,
          service: null,
        }
        metrics.fgwHttpRequestsTotal.increase()
      }
    )
    .handleMessageEnd(
      function (msg) {
        $ctx.tail = msg.tail
        $ctx.tailTime = Date.now()
      }
    )
    .pipeNext(() => $ctx)
    .handleMessageStart(
      function (msg) {
        var r = $ctx.response
        r.head = msg.head
        r.headTime = Date.now()
      }
    )
    .handleMessageEnd(
      function (msg) {
        var r = $ctx.response
        r.tail = msg.tail
        r.tailTime = Date.now()
      }
    )
  )
)
