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

export default function(option = {}) {
  const ip = getNetworkIp()
  const port = option.port || 7788
  // const context = option.context ||  ['/saas-webserver', '/ding-webserver', '/account-webserver']
  return {
    port,
    host: ip,
    // proxy: {
    //   '/saas-webserver': {
    //     target: `http://${ip}:${port}`,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/saas-webserver' : '/saas-webserver'
    //     }
    //   },
    // },
    // proxy: [{
    //   context,
    //   target: `http://${ip}:${port}`
    // }],
    before: app =>
      mock({
        app,
        ...option,
        // context
      })
  }
}
// if(process.env.proxy) {
//   const proxy = process.env.proxy
//   const apiUrl = process.env.VUE_APP_API_DING_URL
//   const list = ['/saas-webserver', '/ding-webserver', '/account-webserver']
//   const myUrl = new URL(proxy)
//   let result = {}
//   list.map((item) => {
//     result[item] = {
//       target: proxy.indexOf(item) !== -1 ? `http://${myUrl.host}` : apiUrl,
//       changeOrigin: true,
//       pathRewrite: {
//         ['^' + item]: ''
//       }
//     }
//   })
//   devServer.proxy = result
// }
