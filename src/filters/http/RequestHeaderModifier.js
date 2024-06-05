export default function (config) {
  var $ctx

  var set = config.RequestHeaderModifier.Set
  var add = config.RequestHeaderModifier.Add
  var del = config.RequestHeaderModifier.Remove

  if (set) set = set.map(({ Name, Value }) => [Name.toLowerCase(), Value])
  if (add) add = add.map(({ Name, Value }) => [Name.toLowerCase(), Value, ',' + Value])
  if (del) del = del.map(name => name.toLowerCase())

  return pipeline($=>$
    .onStart(c => void ($ctx = c))
    .handleMessageStart(
      function (req) {
        var headers = req.head.headers
        if (set) set.forEach(([k, v]) => headers[k] = v)
        if (add) add.forEach(([k, v, w]) => {
          var u = headers[k]
          if (u) {
            headers[k] = u + w
          } else {
            headers[k] = v
          }
        })
        if (del) del.forEach(k => delete headers[k])
      }
    )
    .pipeNext()
  )
}
