import { log, isIdentical } from './utils.js'

var DEFAULT_CONFIG_PATH = '/etc/fgw'

var resources = null
var files = {}
var secrets = {}

var notifyCreate = () => {}
var notifyDelete = () => {}
var notifyUpdate = () => {}

function init(pathname, onChange) {
  var configFile = pipy.load('/config.json') || pipy.load('/config.yaml')
  var configDir = pipy.list('/config')
  var hasBuiltinConfig = (configDir.length > 0 || Boolean(configFile))

  if (pathname || !hasBuiltinConfig) {
    pathname = os.path.resolve(pathname || DEFAULT_CONFIG_PATH)
    var s = os.stat(pathname)
    if (!s) {
      throw `configuration file or directory does not exist: ${pathname}`
    }
    if (s.isDirectory()) {
      pipy.mount('config', pathname)
      configFile = null
    } else if (s.isFile()) {
      configFile = os.read(pathname)
    }
  }

  if (configFile) {
    var config
    try {
      try {
        config = JSON.decode(configFile)
      } catch {
        config = YAML.decode(configFile)
      }
    } catch {
      throw 'cannot parse configuration file as JSON or YAML'
    }

    resources = config.resources
    Object.entries(config.secrets || {}).forEach(([k, v]) => secrets[k] = v)

  } else {
    notifyCreate = function (resource) { onChange(resource, null) }
    notifyDelete = function (resource) { onChange(null, resource) }
    notifyUpdate = function (resource, old) { onChange(resource, old) }

    pipy.list('/config').forEach(
      pathname => {
        var pathname = os.path.join('/config', pathname)
        var data = readFile(pathname)
        if (data && data.kind && data.spec) {
          log?.(`Load resource file: ${pathname}`)
          files[pathname] = data
        }
      }
    )

    function watch() {
      pipy.watch('/config/').then(pathnames => {
        log?.('Resource files changed:', pathnames)
        pathnames.forEach(pathname => {
          var old = files[pathname]
          var cur = readFile(pathname)
          var oldKind = old?.kind
          var curKind = cur?.kind
          if (curKind && curKind === oldKind) {
            files[pathname] = cur
            notifyUpdate(cur, old)
          } else if (curKind && oldKind) {
            files[pathname] = cur
            notifyDelete(old)
            notifyCreate(cur)
          } else if (cur) {
            files[pathname] = cur
            notifyCreate(cur)
          } else if (old) {
            delete files[pathname]
            notifyDelete(old)
          }
        })
        watch()
      })
    }

    if (onChange) watch()
  }
}

function list(kind) {
  if (resources) {
    return resources.filter(r => r.kind === kind)
  } else {
    return Object.values(files).filter(r => r.kind === kind)
  }
}

function readFile(pathname) {
  try {
    if (isJSON(pathname)) {
      return JSON.decode(pipy.load(pathname))
    } else if (isYAML(pathname)) {
      return YAML.decode(pipy.load(pathname))
    } else if (isSecret(pathname)) {
      var name = os.path.basename(pathname)
      secrets[name] = pipy.load(pathname)
    }
  } catch {
    console.error(`Cannot load or parse file: ${pathname}, skpped.`)
  }
}

function isJSON(filename) {
  return filename.endsWith('.json')
}

function isYAML(filename) {
  return filename.endsWith('.yaml') || filename.endsWith('.yml')
}

function isSecret(filename) {
  return filename.endsWith('.crt') || filename.endsWith('.key')
}

var updaterLists = []

function findUpdaterKey(key) {
  return updaterLists.findIndex(
    ([k]) => isIdentical(k, key)
  )
}

function addUpdater(key, updater) {
  var i = findUpdaterKey(key)
  if (i >= 0) {
    updaterLists[i][1].push(updater)
  } else {
    if (key instanceof Array) key = [...key]
    updaterLists.push([key, [updater]])
  }
}

function getUpdaters(key) {
  var i = findUpdaterKey(key)
  if (i >= 0) return updaterLists[i][1]
  return []
}

export default {
  init,
  list,
  secrets,
  addUpdater,
  getUpdaters,
}
