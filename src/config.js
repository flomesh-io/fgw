import options from './options.js'

var opts = options(pipy.argv, {
  defaults: {
    '--config': '',
  },
  shorthands: {
    '-c': '--config',
  },
})

var configFilename = opts['--config']
var config = JSON.decode(
  configFilename
    ? os.read(configFilename)
    : pipy.load('config.json')
)

export default config
