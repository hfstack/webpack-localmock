'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var os = _interopDefault(require('os'));

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

var _0777 = parseInt('0777', 8);

var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777;
    }
    if (!made) made = null;
    
    var cb = f || function () {};
    p = path.resolve(p);
    
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                if (path.dirname(p) === p) return cb(er);
                mkdirP(path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                xfs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made);
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = _0777;
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

const {
  join
} = path;
const getDirName = path.dirname;
/**
 * 获取指定目录下的文件
 * @param {*} jsonPath
 */

const getJsonFiles = function (jsonPath) {
  const jsonFiles = [];

  function findJsonFile(path) {
    const files = fs.readdirSync(path);
    files.forEach(item => {
      const fPath = join(path, item);
      const stat = fs.statSync(fPath);

      if (stat.isDirectory() === true) {
        findJsonFile(fPath);
      }

      if (stat.isFile() === true) {
        if (fPath.indexOf('.json') > -1) {
          jsonFiles.push(fPath.replace('mock/api/', ''));
        }
      }
    });
  }

  findJsonFile(jsonPath);
  return jsonFiles;
};
/**
 * 写文件到指定文件目录
 * @param {*} path
 * @param {*} contents
 * @param {*} cb
 */


const writeFile = function (path, contents, cb) {
  mkdirp(getDirName(path), err => {
    if (err) return cb(err);
    fs.writeFileSync(path, contents, cb);
  });
};
/**
 * url格式化
 * @param {*} url
 * @param {*} config
 */


const urlFormat = function (url, config) {
  const {
    placeholder,
    tokenReg
  } = config;
  let rqPath = url.replace(/\/\/ | null | undefined/g, `/${placeholder}/`);
  rqPath = rqPath.split('/').map(item => {
    if (item && tokenReg.test(item)) {
      item = item.replace(tokenReg, placeholder);
    }

    return item;
  }).join('/');
  rqPath = rqPath.replace(`/${placeholder}\\w*/g`, 'test');
  return rqPath;
};

var util = {
  urlFormat,
  getJsonFiles,
  writeFile
};

var mock = function (option) {
  const config = {
    app: option.app,
    proxyToken: 'api',
    mockDir: 'mock',
    placeholder: 'test',
    tokenReg: new RegExp(/^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!-@#$%^&*]{12,56}$/, 'g'),
    ...option
  };
  const {
    app,
    proxyToken,
    placeholder,
    mockDir
  } = config;
  app.all(`/${proxyToken}/*`, async (req, res) => {
    const rqPath = util.urlFormat(req.path, config);
    const JSFilePath = path.join(__dirname, `../${mockDir}/`, `${rqPath}.js`);
    const JSONFilePath = path.join(__dirname, `../${mockDir}/`, `${rqPath}.json`);

    if (fs.existsSync(JSFilePath)) {
      const params = req.path.match(`/${placeholder}\\w*/g`);
      commonjsRequire()(req, res, params && params.length ? params[0] : '');
    } else if (fs.existsSync(JSONFilePath)) {
      const file = fs.readFileSync(JSONFilePath);
      setTimeout(() => {
        res.json(JSON.parse(file));
      }, 200);
    } else {
      util.writeFile(JSONFilePath, JSON.stringify({
        code: 0,
        message: '成功',
        data: null
      }));
      res.json({
        code: 0,
        message: '成功',
        data: null
      });
    }
  });
  app.get('/localmock', async (req, res) => {
    res.sendFile(path.resolve(__dirname, './localmock.html'));
  });
  app.get('/apimock/urls', async (req, res) => {
    res.json({
      code: 0,
      message: '成功',
      data: util.getJsonFiles('mock')
    });
  });
  app.get('/apimock/json', async (req, res) => {
    const {
      url
    } = req.query;
    const data = fs.readFileSync(`mock/api/${url}`);
    res.json({
      code: 0,
      message: '成功',
      data: data.toString()
    });
  });
  app.post('/apimock/save', async (req, res) => {
    const {
      url,
      json
    } = req.body;
    console.log(req.body);
    fs.writeFileSync(`${mockDir}/${proxyToken}/${url}`, json);
    res.json({
      code: 0,
      message: '成功',
      data: null
    });
  });
  app.post('/apimock/create', async (req, res) => {
    const {
      url,
      json
    } = req.body;
    let realUrl = util.urlFormat(url, config);

    if (realUrl.indexOf('.json') === -1) {
      realUrl += '.json';
    }

    fs.writeFileSync(`${mockDir}/${proxyToken}/${realUrl}`, json);
    res.json({
      code: 0,
      message: '成功',
      data: null
    });
  });
};

const getNetworkIp = function () {
  let needHost = ''; // 打开的host

  try {
    // 获得网络接口列表
    const network = os.networkInterfaces();

    for (const dev in network) {
      const iface = network[dev];

      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];

        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          needHost = alias.address;
          return needHost;
        }
      }
    }
  } catch (e) {
    needHost = 'localhost';
  }

  return needHost;
};

var src = function (option) {
  return {
    port: 7788,
    host: getNetworkIp(),
    before: app => mock({
      app,
      ...option
    }),
    ...option
  };
};

module.exports = src;
