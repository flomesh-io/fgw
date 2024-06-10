export function stringifyHTTPHeaders(headers) {
  return Object.entries(headers).flatMap(
    ([k, v]) => {
      if (v instanceof Array) {
        return v.map(v => `${k}=${v}`)
      } else {
        return `${k}=${v}`
      }
    }
  ).join(' ')
}

export function makeFilters(layer, filters) {
  if (!filters) return []
  return filters.map(
    config => {
      var maker = pipy.import(`./filters/${layer}/${config.Type}.js`).default
      return maker(config)
    }
  )
}
