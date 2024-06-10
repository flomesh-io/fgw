import options from './options.js'

var opts = options(pipy.argv, {
  defaults: {
    '--config': '',
  },
  shorthands: {
    '-c': '--config',
  },
})

var config
var configFilename = opts['--config']

if (configFilename) {
  if (configFilename.endsWith('.yaml') || configFilename.endsWith('.yml')) {
    config = YAML.decode(os.read(configFilename))
  } else {
    config = JSON.decode(os.read(configFilename))
  }
} else {
  config = JSON.decode(pipy.load('config.json'))
}

export default config
