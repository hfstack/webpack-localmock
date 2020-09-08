import { urlFormat, writeFile, getJsonFiles, getConfig} from './util.js'
// import axios from 'axios'

const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')

export default function(option) {
  const config = getConfig(option)
  const { app, proxyToken, placeholder, mockDir } = config
  // const context = ['/saas-webserver', '/ding-webserver', '/account-webserver']
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.all(`/${proxyToken}/*`, async (req, res) => {
    const rqPath = urlFormat(req.path, config)
    const JSFilePath = path.join(__dirname, `../../../${mockDir}/`, `${rqPath}.js`)
    const JSONFilePath = path.join(__dirname, `../../../${mockDir}/`, `${rqPath}.json`)

    if (fs.existsSync(JSFilePath)) {
      const params = req.path.match(`/${placeholder}\\w*/g`)
      require(JSFilePath)(req, res, params && params.length ? params[0] : '')
    } else if (fs.existsSync(JSONFilePath)) {
      const file = fs.readFileSync(JSONFilePath)
      setTimeout(() => {
        res.json(JSON.parse(file))
      }, 200)
    } else {
      writeFile(
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
  // if (context && Array.isArray(context) && context.length) {
  //   context.forEach((item) => {
  //     app.all(`/${item}/*`, async(req, res) => {
  //       axios({
  //         method: req.method,
  //         url: req.originalUrl,
  //         data: req.query,
  //         headers: req.headers
  //       }).then(response => {
  //         return res.json(response.data)
  //       }).catch(e => {
  //         console.log(e)
  //       })
  //     })
  //   })
  // }
  app.get('/localmock', async (req, res) => {
    res.sendFile(path.resolve(__dirname, './localmock.html'))
  })
  app.get('/apimock/urls', async (req, res) => {
    res.json({
      code: 0,
      message: '成功',
      data: getJsonFiles(config),
    })
  })
  app.get('/apimock/json', async (req, res) => {
    const { url } = req.query
    const data = fs.readFileSync(`${config.mockDir}/${config.proxyToken}/${url}`)
    res.json({
      code: 0,
      message: '成功',
      data: data.toString(),
    })
  })
  app.post('/apimock/save', async (req, res) => {
    const { url, json } = req.body
    const localUrl= path.normalize(`${mockDir}/${proxyToken}/${url}`)
    fs.writeFileSync(localUrl, json)
    res.json({
      code: 0,
      message: '成功',
      data: null,
    })
  })
  app.post('/apimock/create', async (req, res) => {
    const { url, json } = req.body
    let realUrl = urlFormat(url, config)
    if (realUrl.indexOf('.json') === -1) {
      realUrl += '.json'
    }
    const localUrl= path.normalize(`${mockDir}/${proxyToken}/${realUrl}`)
    writeFile(localUrl, json)
    res.json({
      code: 0,
      message: '成功',
      data: null,
    })
  })
}
