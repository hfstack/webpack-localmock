const util = require('./util.js')
const path = require('path')
const fs = require('fs')

module.exports = function(option) {
  const config = {
    app: option.app,
    proxyToken: 'api',
    mockDir: 'mock',
    placeholder: 'test',
    tokenReg: new RegExp(/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!-@#$%^&*]{12,56}$/, 'g'),
    ...option,
  }
  const { app, proxyToken, placeholder, mockDir } = config
  app.all(`/${proxyToken}/*`, async (req, res) => {
    const rqPath = util.urlFormat(req.path, config)
    const JSFilePath = path.join(__dirname, `../${mockDir}/`, `${rqPath}.js`)
    const JSONFilePath = path.join(__dirname, `../${mockDir}/`, `${rqPath}.json`)

    if (fs.existsSync(JSFilePath)) {
      const params = req.path.match(`/${placeholder}\\w*/g`)
      require(JSFilePath)(req, res, params && params.length ? params[0] : '')
    } else if (fs.existsSync(JSONFilePath)) {
      const file = fs.readFileSync(JSONFilePath)
      setTimeout(() => {
        res.json(JSON.parse(file))
      }, 200)
    } else {
      util.writeFile(
        JSONFilePath,
        JSON.stringify({
          code: 0,
          message: '成功',
          data: null,
        })
      )
      res.json({
        code: 0,
        message: '成功',
        data: null,
      })
    }
  })
  app.get('/localmock', async (req, res) => {
    res.sendFile(path.resolve(__dirname, './localmock.html'))
  })
  app.get('/apimock/urls', async (req, res) => {
    res.json({
      code: 0,
      message: '成功',
      data: util.getJsonFiles('mock'),
    })
  })
  app.get('/apimock/json', async (req, res) => {
    const { url } = req.query
    const data = fs.readFileSync(`mock/api/${url}`)
    res.json({
      code: 0,
      message: '成功',
      data: data.toString(),
    })
  })
  app.post('/apimock/save', async (req, res) => {
    const { url, json } = req.body
    console.log(req.body)
    fs.writeFileSync(`${mockDir}/${proxyToken}/${url}`, json)
    res.json({
      code: 0,
      message: '成功',
      data: null,
    })
  })
  app.post('/apimock/create', async (req, res) => {
    const { url, json } = req.body
    let realUrl = util.urlFormat(url, config)
    if (realUrl.indexOf('.json') === -1) {
      realUrl += '.json'
    }
    fs.writeFileSync(`${mockDir}/${proxyToken}/${realUrl}`, json)
    res.json({
      code: 0,
      message: '成功',
      data: null,
    })
  })
}
