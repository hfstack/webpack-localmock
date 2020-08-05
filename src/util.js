const { join } = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname

/**
 * 获取指定目录下的文件
 * @param {*} jsonPath
 */
const getJsonFiles = function(jsonPath, config) {
  const { mockDir = 'mock', proxyToken = 'api' } = config 
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
          jsonFiles.push(fPath.replace(`${mockDir}/${proxyToken}/`, ''))
        }
      }
    })
  }
  findJsonFile(jsonPath)

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
  let rqPath = url.replace(/\/\/ | null | undefined/g, `/${placeholder}/`)
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
export {
  urlFormat,
  getJsonFiles,
  writeFile,
}
