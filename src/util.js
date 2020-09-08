const { join, normalize } = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname

/**
 * 获取指定目录下的文件
 * @param {*} jsonPath
 */
const getJsonFiles = function(config) {
  const { mockDir = 'mock', proxyToken = 'api' } = config 
  const mockBaseUrl = normalize(`${mockDir}/${proxyToken}/`)
  const jsonFiles = []
  function findJsonFile(path) {
    const files = fs.readdirSync(path)
    files.forEach(item => {
      const fPath = join(path, item)
      const stat = fs.statSync(fPath)
      if (stat.isDirectory() === true) {
        findJsonFile(fPath)
      }
      if (stat.isFile() === true) {
        if (fPath.indexOf('.json') > -1) {
          jsonFiles.push(fPath.replace(mockBaseUrl, ''))
        }
      }
    })
  }
  findJsonFile(mockDir)

  return jsonFiles
}

/**
 * 写文件到指定文件目录
 * @param {*} path
 * @param {*} contents
 * @param {*} cb
 */
const writeFile = function(path, contents, cb) {
  mkdirp(getDirName(path), err => {
    if (err) return cb(err)

    fs.writeFileSync(path, contents, cb)
  })
}

/**
 * url格式化
 * @param {*} url
 * @param {*} config
 */
const urlFormat = function(url, config) {
  const { placeholder, tokenReg } = config
  let rqPath = url.replace(/(\/\/) | (null) | (undefined)/g, `/${placeholder}/`)
  rqPath = rqPath
    .split('/')
    .map(item => {
      if (item && tokenReg.test(item)) {
        item = item.replace(tokenReg, placeholder)
      }

      return item
    })
    .join('/')
  rqPath = rqPath.replace(`/${placeholder}\\w*/g`, 'test')

  return rqPath
}
/**
 * 获取localmock配置
 * @param {*} option 
 */
const getConfig = function(option) {
  const config = {
    proxyToken: 'api',
    mockDir: 'mock',
    placeholder: 'test',
    tokenReg: new RegExp(/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!-@#$%^&*]{12,56}$/, 'g'),
    ...option,
  }
  return config
}
/**
 * 属性继承
 */
const extend = function(src)  {
  let arg = arguments;
  if (arg.length >= 2) {
      for (let i = 1, len = arg.length; i < len; i++) {
          for (let key in arg[i]) {
              src[key] = arg[i][key];
          }
      }
  }
  return src;
}
const getApiResponse = function(req, res, option) {
  const config= getConfig(option)
  let realUrl = urlFormat(req.path, config)
  if (realUrl.indexOf('.json') === -1) {
    realUrl += '.json'
  }
  const localUrl= normalize(`${config.mockDir}/${config.proxyToken}/${realUrl}`)
  fs.writeFileSync(localUrl, res.json)
}

export {
  urlFormat,
  getJsonFiles,
  writeFile,
  getConfig,
  extend,
  getApiResponse
}
