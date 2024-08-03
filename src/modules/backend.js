import resources from '../resources.js'

var cache = new algo.Cache(
  backendName => {
    var targets = findTargets(backendName)
    return {
      name: backendName,
      concurrency: 0,
      targets: {},
      balancer: new algo.LoadBalancer(
        targets, {
          key: t => t.address,
          weight: t => t.weight,
        }
      ),
    }
  }
)

function findTargets(backendName) {
  var backendResource = resources.list('Backend').find(
    r => r.metadata?.name === backendName
  )
  if (!backendResource?.spec?.targets) return []
  return backendResource.spec.targets.map(t => {
    var port = t.port || backendRef.port
    var address = `${t.address}:${port}`
    var weight = t.weight
    return { address, weight }
  })
}

export default function (backendName) {
  return cache.get(backendName)
}
