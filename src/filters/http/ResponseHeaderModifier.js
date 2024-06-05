export default function (config) {
  var $ctx

  var set = config.ResponseHeaderModifier.Set
  var add = config.ResponseHeaderModifier.Add
  var del = config.ResponseHeaderModifier.Remove

  if (set) set = set.map(({ Name, Value }) => [Name.toLowerCase(), Value])
  if (add) add = add.map(({ Name, Value }) => [Name.toLowerCase(), Value, ',' + Value])
  if (del) del = del.map(name => name.toLowerCase())

  return pipeline($=>$
    .onStart(c => void ($ctx = c))
    .pipeNext()
    .handleMessageStart(
      function (res) {
        var headers = res.head.headers
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
  )
}
