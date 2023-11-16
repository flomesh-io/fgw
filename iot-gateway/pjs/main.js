((

  initCfg = JSON.decode(pipy.load('init.json')),

) => pipy()

.import({
  __deviceConfig: 'rest',
})


// query config from strapi
.task(initCfg.queryInterval)
.onStart(
  () => (
    new Data
  )
)
.use('rest.js', 'query')


// collect data
.task(initCfg.collectInterval)
.onStart(
  () => (
    new Data
  )
)
.branch(
  () => __deviceConfig?.actived, (
    $=>$.use('worker.js', 'collect')
  ), (
    $=>$.replaceStreamStart(
      () => new StreamEnd
    )
  )
)


// post data to strapi
.task(initCfg.postInterval)
.onStart(
  () => (
    new Data
  )
)
.branch(
  () => __deviceConfig?.actived, (
    $=>$.use('worker.js', 'post')
  ), (
    $=>$.replaceStreamStart(
      () => new StreamEnd
    )
  )
)

)()