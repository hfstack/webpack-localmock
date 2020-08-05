const os = require('os')
import mock from './mock'

const getNetworkIp = function() {
  let needHost = '' // 打开的host
  try {
    // 获得网络接口列表
    const network = os.networkInterfaces()
    for (const dev in network) {
      const iface = network[dev]
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i]
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          needHost = alias.address

          return needHost
        }
      }
    }
  } catch (e) {
    needHost = 'localhost'
  }

  return needHost
}

export default function(option) {
  return {
    port: 7788,
    host: getNetworkIp(),
    before: app =>
      mock({
        app,
        ...option,
      }),
    ...option,
  }
}
