import * as net from 'net'

export function findAvailablePort(startPort = 40000, maxRetries = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    function tryPort(port: number) {
      const server = net.createServer()
      server.unref()
      server.on('error', () => {
        attempts++
        if (attempts >= maxRetries) {
          reject(new Error(`No available port found after ${maxRetries} attempts`))
        } else {
          tryPort(port + 1)
        }
      })
      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(port))
      })
    }
    tryPort(startPort + Math.floor(Math.random() * 1000))
  })
}
