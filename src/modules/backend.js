import resources from '../resources.js'

var cache = new algo.Cache(
  backendName => {
    var targets = findTargets(backendName)
    var balancer = new algo.LoadBalancer(
      targets, {
        key: t => t.address,
        weight: t => t.weight,
      }
    )

    function watch() {
      resources.addUpdater('Backend', backendName, () => {
        var backendResource = findBackendResource(backendName)
        if (backendResource) {
          var targets = getTargets(backendResource)
          balancer.provision(targets)
          watch()
        } else {
          cache.remove(backendName)
        }
      })
    }

    watch()

    return {
      name: backendName,
      concurrency: 0,
      targets: {},
      balancer,
    }
  }
)

function findTargets(backendName) {
  return getTargets(findBackendResource(backendName))
}

function findBackendResource(backendName) {
  return resources.list('Backend').find(
    r => r.metadata?.name === backendName
  )
}

function getTargets(backendResource) {
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
