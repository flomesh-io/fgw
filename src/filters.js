export default function (protocol, filters) {
  if (!filters) return []
  return filters.map(
    config => {
      var maker = (
        importFilter(`../config/filters/${protocol}/${config.type}.js`) ||
        importFilter(`../filters/${protocol}/${config.type}.js`)
      )
      if (!maker) throw `${protocol} filter not found: ${config.type}`
      if (typeof maker !== 'function') throw `filter ${config.type} is not a function`
      return maker(config)
    }
  )
}

function importFilter(pathname) {
  if (!pipy.load(pathname)) return null
  try {
    var filter = pipy.import(pathname)
    return filter.default
  } catch {
    return null
  }
}
