export default function (config, layer, rule, makeBackendTargetCB) {
  var ruleFilters = makeFilters(layer, rule?.filters)

  var refs = rule?.backendRefs || []
  if (refs.length > 1) {
    var lb = new algo.LoadBalancer(
      refs.map(ref => makeBackendTarget(rule, ruleFilters, ref)),
      {
        weight: t => t.weight,
      }
    )
    return () => lb.allocate()
  } else {
    var singleSelection = { target: makeBackendTarget(rule, ruleFilters, refs[0]) }
    return () => singleSelection
  }

  function makeBackendTarget(rule, ruleFilters, backendRef) {
    var filters = [
      ...ruleFilters,
      ...makeFilters(layer, backendRef?.filters),
    ]
    var backendResource = findBackendResource(backendRef)
    return makeBackendTargetCB(rule, backendRef, backendResource, filters)
  }

  function findBackendResource(backendRef) {
    if (backendRef) {
      var kind = backendRef.kind || 'Backend'
      var name = backendRef.name
      return config.resources.find(
        r => r.kind === kind && r.metadata.name === name
      )
    }
  }

  function makeFilters(layer, filters) {
    if (!filters) return []
    return filters.map(
      config => {
        var maker = pipy.import(`./filters/${layer}/${config.Type}.js`).default
        return maker(config)
      }
    )
  }
}
