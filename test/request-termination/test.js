export default function ({ fetch, log }) {
  return fetch('localhost:8000', 'GET', 'http://localhost:8000').then(
    res => {
      var status = res?.head?.status || 0
      var headers = res?.head?.headers || {}
      var body = res?.body?.toString?.()
      log(status, headers, body)
      return status === 200 && headers.foo === 'bar' && body === 'Hello!'
    }
  )
}
