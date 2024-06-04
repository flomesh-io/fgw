export function makeFilters(layer, filters) {
  if (!filters) return []
  return filters.map(
    config => {
      var ctor = pipy.import(`./filters/${layer}/${config.Type}.js`).default
      return ctor(config)
    }
  )
}
