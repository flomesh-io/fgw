export function stringifyHTTPHeaders(headers) {
  return Object.entries(headers).flatMap(
    ([k, v]) => {
      if (v instanceof Array) {
        return v.map(v => `${k}=${v}`)
      } else {
        return `${k}=${v}`
      }
    }
  ).join(' ')
}
