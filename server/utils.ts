import os from 'os'

export function getIPv4AddressList(): string[] {
  const networkInterfaces = os.networkInterfaces()
  let result: string[] = []

  Object.keys(networkInterfaces).forEach((key) => {
    const ips = (networkInterfaces[key] || [])
      .filter((details) => details.family === 'IPv4')
      .map((detail) => detail.address.replace('127.0.0.1', 'localhost'))

    result = result.concat(ips)
  })

  return result
}
