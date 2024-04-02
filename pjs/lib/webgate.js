(
  (
    { isWebGateEnabled } = pipy.solve('config.js'),
  ) => (
    {
      webgateEnabled: Boolean(isWebGateEnabled),

      initWebGateHeaders: (headers, proto) => (
        (
          sampled = Boolean(isWebGateEnabled),
          flags = '00',
          uuid = algo.uuid(),
          randomId = uuid.replaceAll('-', ''),
          traceId = randomId.substring(0, 16),
          spanId = randomId.substring(16, 24),
        ) => (
          sampled && (flags = '01'),

          !headers['webgate-tracestate'] && (
            headers['webgate-tracestate'] = `00-${traceId}-${spanId}-${flags}`
          ),

          sampled
        )
      )()
    }
  )

)()