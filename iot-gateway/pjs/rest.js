((
  initCfg = JSON.decode(pipy.load('init.json')),

  deviceConfig = { strapiJwt: null },

  compareObject = (obj1, obj2) => (
    (
      eq = true,
    ) => (
      Object.keys(obj2 || {}).forEach(
        key => (obj2[key] !== obj1?.[key]) && (eq = false)
      ),
      eq
    )
  )(),

  mergeObject = (obj1, obj2) => (
    Object.keys(obj2 || {}).forEach(
      key => obj1[key] = obj2[key]
    ),
    obj1
  ),

  saveInitCfg = () => (
    (
      filepath = initCfg.workDir.endsWith('/') ? initCfg.workDir : initCfg.workDir + '/',
    ) => (
      os.writeFile(filepath + 'init.json', JSON.stringify(initCfg, null, 4))
    )
  )(),

  workerJsHash = (
    (
      filepath = initCfg.workDir.endsWith('/') ? initCfg.workDir : initCfg.workDir + '/',
      workerJs = os.readFile(filepath + 'worker.js'),
    ) => (
      algo.hash(workerJs?.toString?.() || '')
    )
  )(),

  saveWorkerJs = (jsString) => (
    (
      filepath = initCfg.workDir.endsWith('/') ? initCfg.workDir : initCfg.workDir + '/',
    ) => (
      os.writeFile(filepath + 'worker.js', jsString)
    )
  )(),

  configObj = null,

  configHash = (
    (
      filepath = initCfg.workDir.endsWith('/') ? initCfg.workDir : initCfg.workDir + '/',
      config = os.readFile(filepath + 'config.json'),
    ) => (
      configObj = JSON.decode(new Data(config || '{}')),
      algo.hash(config?.toString?.() || '')
    )
  )(),

  saveConfig = (jsString) => (
    (
      filepath = initCfg.workDir.endsWith('/') ? initCfg.workDir : initCfg.workDir + '/',
    ) => (
      os.writeFile(filepath + 'config.json', jsString)
    )
  )(),

  updateConfig = cfg => (
    deviceConfig.device = cfg?.data?.[0]?.id,
    deviceConfig.config = cfg?.data?.[0]?.attributes?.config,
    deviceConfig.uuid = cfg?.data?.[0]?.attributes?.uuid,
    deviceConfig.name = cfg?.data?.[0]?.attributes?.name,
    deviceConfig.actived = cfg?.data?.[0]?.attributes?.actived,
    deviceConfig.drive = cfg?.data?.[0]?.attributes?.drive?.data?.id,

    deviceConfig.init = deviceConfig?.config?.init,
    deviceConfig.script = cfg?.data?.[0]?.attributes?.drive?.data?.attributes?.script,

    (deviceConfig?.script?.length > 0) && (algo.hash(deviceConfig.script) != workerJsHash) && (
      deviceConfig.actived = false,
      saveWorkerJs(deviceConfig.script),
      pipy.restart(),
      console.log('save worker.js, restart pipy.')
    ),

    !compareObject(initCfg, deviceConfig.init) && (
      deviceConfig.actived = false,
      mergeObject(initCfg, deviceConfig.init),
      saveInitCfg(),
      pipy.restart(),
      console.log('save init.json, restart pipy.')
    ),

    (
      (
        configJson = JSON.stringify(cfg, null, 4),
        newConfigHash = algo.hash(configJson)
      ) => (
        (newConfigHash !== configHash) && (
          saveConfig(configJson),
          configHash = newConfigHash,
          console.log('save config.json.')
        )
      )
    )()
  ),

) => (

configObj?.data?.[0]?.id > 0 && updateConfig(configObj),
console.log(`local config.json, hash: ${configHash}`),

pipy()
.export('rest', {
  __deviceConfig: deviceConfig,
})


.pipeline('login')
.onStart(
  () => (
    deviceConfig.strapiJwt = null,
    new Message(
      {
        method: 'POST',
        host: initCfg.strapiHost,
        path: initCfg.loginUri,
        headers: {'Content-Type': 'application/json'}
      },
      `{"identifier": "${initCfg.loginUser}","password":"${initCfg.loginPassword}"}`
    )
  )
)
.replay({ delay: () => '5s' }).to(
  $=>$
  .muxHTTP(() => ({})).to(
    $=>$.connect(initCfg.strapiHost)
  )
  .replaceMessage(
    msg => (
      (
        /// debug = console.log('msg body:', msg?.body),
        resp = (msg?.body?.toString?.().charAt(0) === '{') && JSON.decode(msg?.body),
      ) => (
        deviceConfig.strapiJwt = resp?.jwt,
        new Message
      )
    )()
  )
  .branch(
    () => deviceConfig.strapiJwt, (
      $=>$.replaceMessage(
        () => (
          console.log('login strapi, jwt:', '......' + deviceConfig?.strapiJwt?.substring?.(deviceConfig.strapiJwt.length - 32)),
          new StreamEnd
        )
      )
    ), (
      $=>$.replaceMessage(
        () => (
          new StreamEnd('Replay')
        )
      )
    )
  )
)


// query config
.pipeline('query')
.replay({
  delay: () => '5s'
}).to(
  $=>$
  .branch(
    () => !deviceConfig.strapiJwt, (
      $=>$
      .link('login')
      .replaceData()
    ), (
      $=>$
    )
  )
  .replaceStreamStart(
    () => (
      new Message(
        {
          method: 'GET',
          host: initCfg.strapiHost,
          path: `${initCfg.queryUri}${initCfg.uuid}`,
          headers: { 'Authorization': 'Bearer ' + deviceConfig.strapiJwt }
        }
      )
    )
  )
  .muxHTTP().to(
    $=>$.connect(initCfg.strapiHost)
  )
  .replaceMessage(
    msg => (
      (
        /// debug = console.log('query config:', msg?.body?.toString?.()),
        resp = (msg?.body?.toString?.().charAt(0) === '{') && JSON.decode(msg?.body),
      ) => (
        (msg?.head?.status === 401) ? (
          deviceConfig.strapiJwt = null,
          new StreamEnd('Replay')
        ) : (
          (resp?.data?.[0]?.id > 0) && (
            updateConfig(resp)
          ),
          new StreamEnd
        )
      )
    )()
  )
)


// post data to strapi
.pipeline('post')
.branch(
  () => deviceConfig.strapiJwt, (
    $=>$
    .replaceMessage(
      msg => (
        new Message(
          {
            method: 'POST',
            host: initCfg.strapiHost,
            path: initCfg.postUri,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + deviceConfig.strapiJwt }
          },
          msg.body
        )
      )
    )
    .muxHTTP().to($=>$.connect(initCfg.strapiHost))
    .replaceMessage(
      msg => (
        (
          resp = (msg?.body?.toString?.().charAt(0) === '{') && JSON.decode(msg?.body),
        ) => (
          (msg?.head?.status === 200 && resp?.data?.id > 0) ? (
            [new Message('OK'), new StreamEnd]
          ) : (
            (msg?.head?.status === 401) ? (
              [new Message('FAIL/401'), new StreamEnd]
            ) : (
              [new Message('FAIL'), new StreamEnd]
            )
          )
        )
      )()
    )
  ), (
    $=>$.replaceMessage(
      () => [new Message('FAIL/jwt'), new StreamEnd]
    )
  )
)

))()
