#!/usr/bin/env -S pipy --log-local=null --args

var rootpath = os.path.resolve('.')
var basepath = pipy.argv[1] || ''
var testcases = pipy.list(basepath)
  .filter(path => path === 'test.js' || path.endsWith('/test.js'))
  .map(path => os.path.join(basepath, os.path.dirname(path)))
  .sort()

var results = {}

function runOneTest() {
  os.chdir(rootpath)

  if (testcases.length === 0) {
    println('Summary:')
    Object.entries(results).forEach(
      ([k, v]) => {
        if (v) {
          println('  PASS ', k)
        } else {
          println('  FAIL ', k)
        }
      }
    )
    println('Done.')
    return
  }

  var path = testcases.shift()
  println('Test', path)

  var kill

  startFGW(os.path.join(path)).then(f => {
    kill = f
    println('  Running test...')
    os.chdir(os.path.join(rootpath, path))
    return pipy.import(os.path.join('.', path, 'test.js')).default()
  }).then(ok => {
    kill()
    results[path] = ok
    println(ok ? '  Passed.' : '  Failed.')
    runOneTest()
  }).catch(err => {
    println(`Failed to run test ${path}:`, err)
  })
}

function startFGW(path) {
  var pipyFilename = pipy.exec('which pipy').toString().trim()
  if (!pipyFilename) return Promise.reject('pipy not found')

  var configFilename = os.path.join('.', path, 'config.json')
  var logDirname = os.path.join('logs', path)
  var logFilename = os.path.join(logDirname, 'out.log')

  var cmdline = [
    pipyFilename, '../src/main.js',
    '--log-level=debug:thread',
    '--args',
    '--config', os.path.resolve(configFilename),
  ]

  println(`  Starting fgw...`)
  println(`    ${cmdline.join(' ')}`)

  os.mkdir(logDirname, { recursive: true })

  var startupCallback
  var killProcess

  pipeline($=>$
    .onStart(new Data)
    .insert(new Promise(r => killProcess = r))
    .exec(cmdline, { stderr: true })
    .tee(logFilename)
    .replaceStreamStart(evt => [new MessageStart, evt])
    .split('\n')
    .handleMessage(msg => {
      if (msg.body.toString().indexOf('[thread] Thread 0 started') >= 0) {
        println(`  Started.`)
        startupCallback(() => killProcess(new StreamEnd))
      }
    })
  ).spawn()

  return new Promise(r => startupCallback = r)
}

if (testcases.length > 0) {
  runOneTest()
} else {
  println('No tests found')
}
