(
  (
    { config } = pipy.solve('config.js'),
    { metrics } = pipy.solve('lib/metrics.js'),
    cpuUsage = (
      (
        items = os.readFile('/proc/self/stat')?.toString?.()?.split?.(" "),
        su = os.readFile('/proc/uptime')?.toString?.()?.split?.(".")?.[0],
        dr,
        ur,
      ) => (
        items && su && (
          dr = su - items[21] / 100,
          ur = +items[13] + +items[14],
          (ur / (dr < 0 ? 1 : dr)).toFixed(2)
        )
      )
    ),
    memSize = os.readFile('/proc/meminfo')?.toString?.()?.split?.('\n')?.filter?.(s => s.startsWith('MemTotal'))?.[0]?.split?.(' ')?.filter?.(e => e)?.[1],
    memUsage = (
      (
        ram = os.readFile('/proc/self/statm')?.toString?.()?.split?.(' ')?.[1],
      ) => (
        (+ram * 4 * 100 / memSize).toFixed(2)
      )
    ),
    hostname = pipy.exec('hostname')?.toString?.()?.replaceAll?.('\n', ''),
    cpuUsageMetric = metrics.fgwResourceUsage.withLabels(pipy.uuid || '', pipy.name || '', pipy.source || '', hostname, 'cpu'),
    memUsageMetric = metrics.fgwResourceUsage.withLabels(pipy.uuid || '', pipy.name || '', pipy.source || '', hostname, 'mem'),
  ) => pipy()

.pipeline()
.task(config.Configs.ResourceUsage.ScrapeInterval + 's')
.onStart(
  () => (
    cpuUsageMetric.set(+cpuUsage()),
    memUsageMetric.set(+memUsage()),
    new StreamEnd
  )
)

)()