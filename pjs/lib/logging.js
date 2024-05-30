(
  (
    { isDebugEnabled } = pipy.solve('config.js'),

    {
      namespace,
      kind,
      name,
      pod,
      toInt63,
    } = pipy.solve('lib/utils.js'),

    address = os.env.REMOTE_LOGGING_ADDRESS,
    tracingLimitedID = os.env.REMOTE_LOGGING_SAMPLED_FRACTION && (os.env.REMOTE_LOGGING_SAMPLED_FRACTION * Math.pow(2, 63)),
    accessLog = new logging.JSONLogger('console-access-logger').toStdout().log,
    logLogging = address && new logging.JSONLogger('access-logger').toHTTP('http://' + address +
      (os.env.REMOTE_LOGGING_ENDPOINT || '/?query=insert%20into%20log(message)%20format%20JSONAsString'), {
      batch: {
        timeout: 1,
        interval: 1,
        prefix: '[',
        postfix: ']',
        separator: ','
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': os.env.REMOTE_LOGGING_AUTHORIZATION || ''
      }
    }).log,

    initTracingHeaders = (headers) => (
      (
        uuid = algo.uuid(),
        id = uuid.substring(0, 18).replaceAll('-', ''),
      ) => (
        headers['x-forwarded-proto'] = 'http',
        headers['x-b3-spanid'] && (
          (headers['x-b3-parentspanid'] = headers['x-b3-spanid']) && (headers['x-b3-spanid'] = id)
        ),
        !headers['x-b3-traceid'] && (
          (headers['x-b3-traceid'] = id) && (headers['x-b3-spanid'] = id)
        ),
        !headers['x-request-id'] && (
          headers['x-request-id'] = uuid
        ),
        headers['fgw-stats-namespace'] = namespace,
        headers['fgw-stats-kind'] = kind,
        headers['fgw-stats-name'] = name,
        headers['fgw-stats-pod'] = pod
      )
    )(),
  ) => (
    {
      loggingEnabled: Boolean(logLogging),

      makeLoggingData: (msg, remoteAddr, remotePort, localAddr, localPort) => (
        (
          sampled = false,
        ) => (
          msg?.head?.headers && (
            !msg.head.headers['x-b3-traceid'] && (
              initTracingHeaders(msg.head.headers)
            ),
            sampled = (!tracingLimitedID || toInt63(msg.head.headers['x-b3-traceid']) < tracingLimitedID)
          ),
          sampled ? (
            {
              reqTime: Date.now(),
              meshName: os.env.MESH_NAME || '',
              remoteAddr,
              remotePort,
              localAddr,
              localPort,
              node: {
                ip: os.env.POD_IP || '127.0.0.1',
                name: os.env.HOSTNAME || 'localhost',
              },
              pod: {
                ns: os.env.POD_NAMESPACE || 'default',
                ip: os.env.POD_IP || '127.0.0.1',
                name: os.env.POD_NAME || os.env.HOSTNAME || 'localhost',
              },
              trace: {
                id: msg.head.headers?.['x-b3-traceid'] || '',
                span: msg.head.headers?.['x-b3-spanid'] || '',
                parent: msg.head.headers?.['x-b3-parentspanid'] || '',
                sampled: '1',
              },
              req: Object.assign({ reqSize: msg.body.size, body: msg.body.toString('base64') }, msg.head)
            }
          ) : null
        )
      )(),

      saveLoggingData: (loggingData, msg, service, target) => (
        loggingData.service = {
          name: service || 'anonymous', target: target
        },
        loggingData.res = Object.assign({}, msg.head),
        loggingData.res['resSize'] = msg.body.size,
        loggingData.res['body'] = msg.body.toString('base64'),
        loggingData['resTime'] = Date.now(),
        loggingData['endTime'] = Date.now(),
        loggingData['type'] = 'fgw',
        logLogging(loggingData),
        isDebugEnabled && console.log('[logging] json:', loggingData)
      ),

      makeAccessLog: (msg, remoteAddr, remotePort, destAddr, destPort) => (
        () => (
          {
            start_time: Date.now(),
            trace_id: msg.head.headers?.['webgate-tracestate']?.split('-')[2] || '',
            apikey: msg.head.headers?.['http_apikey'] || '',
            remote_addr: remoteAddr,
            remote_port: remotePort,
            dest_addr: destAddr,
            dest_port: destPort,
            username: msg.head.headers?.['username'] || '',
            tenantcode: msg.head.headers?.['tenantcode'] || '',
            x_forward_for: msg.head.headers?.['x-forwarded-for'] || '',
            remote_user: msg.head.headers?.['remote_user'] || '',
            bytes_sent: msg.body.size + msg.head.size,
            vhost: msg.head.headers?.['host'] || '',
            protocol: msg.head?.protocol || '',
            path: msg.head?.path || '',
            request_query: msg.head?.query || '',
            request_length: msg.body.size,
            method: msg.head?.method || '',
            http_referrer: msg.head?.headers?.['referer'] || '',
            user_agent: msg.head?.headers?.['user-agent'] || '',
            upstream_scheme: msg.head?.scheme || '',
            http_host: msg.head?.headers?.['host'] || '',
            request: Object.assign({ reqSize: msg.body.size, body: msg.body.toString('base64') }, msg.head),
            body_bytes_sent: msg.body.size
          }
        )
      )(),

      printAccessLog: (accessLogData, msg, service, target) => (
        accessLog({
          start_time: accessLogData.start_time,
          trace_id: accessLogData.trace_id,
          apikey: accessLogData.apikey,
          remote_addr: accessLogData.remote_addr,
          username: accessLogData.username,
          tenantcode: accessLogData.tenantcode,
          x_forward_for: accessLogData.x_forward_for,
          remote_user: accessLogData.remote_user,
          bytes_sent: accessLogData.bytes_sent,
          response_code: msg.head?.status,
          vhost: accessLogData.vhost,
          protocol: accessLogData.protocol,
          path: accessLogData.path,
          request_query: accessLogData.request_query,
          request_length: accessLogData.request_length,
          duration: Date.now() - accessLogData.start_time,
          method: accessLogData.method,
          http_referrer: accessLogData.http_referrer,
          user_agent: accessLogData.user_agent,
          upstream_cluster: service || '',
          upstream_service_time: Date.now(),
          upstream_status: msg.head?.statusText,
          upstream_scheme: accessLogData.upstream_scheme,
          upstream_host: target || '',
          upstream_uri: 'unknown',
          http_host: accessLogData.http_host,
          request: accessLogData.request,
          body_bytes_sent: accessLogData.body_bytes_sent
        })
      )
    }
  )

)()