'use strict';

const path = require('path');
const { getBaseDir } = require('ee-core/ps');

/**
 * 默认配置
 */
module.exports = () => {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: 'X-Tools', // 软件顶部或左上角名称(会被 html中的 title标签覆盖)
      width: 980,
      height: 650,
      minWidth: 400,
      minHeight: 300,
      webPreferences: {
        //webSecurity: false, // 如果需要跨域，请打开注释
        contextIsolation: false, // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
        nodeIntegration: true, // node模块
        //preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
      },
      frame: true,
      show: true,
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },
    logger: {
      encoding: 'utf8',
      level: 'INFO',
      outputJSON: false,
      buffer: true,
      enablePerformanceTimer: false,
      rotator: 'day', // day:按天切割
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log' 
    },
    // 远程web地址
    remote: {
      enable: false,
      url: 'http://electron-egg.kaka996.com/'
    },
    // 第三方软件，可通过socket-client监听端口，与ee框架通信
    socketServer: {
      enable: false, // 是否启用
      port: 7070,
      isDynamic: false, // 如果值为false，框架默认使用port端口（如果默认端口被使用，则随机获取一个）；如果为true，默认端口无效，框架随机生成
      path: "/socket.io/",
      connectTimeout: 45000, // 客户端连接超时时间
      pingTimeout: 30000, // 心跳检测超时时间
      pingInterval: 25000, // 心跳检测间隔
      maxHttpBufferSize: 1e8, // 每条消息的数据最大值 1M
      transports: ["polling", "websocket"], // http轮询和websocket
      cors: {
        origin: true, // http协议时，要设置允许跨域
      },
      channel: 'socket-channel' // 自定义通道名称，默认socket-channel
    },
    // 内置http服务，可在前端、浏览器、终端命令中，访问EE程序  
    httpServer: {
      enable: false,
      https: {
        enable: false, 
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem'
      },
      host: '127.0.0.1',
      port: 7071, // 默认端口（如果端口被使用，则随机获取一个）
      cors: {
        origin: "*" // 跨域
      },
    },
    body: {
      multipart: true,
      formidable: {
        keepExtensions: true
      }
    },
    filterRequest: {
      uris:  [
        'favicon.ico' // 要过滤的请求uri
      ],
      returnData: '' // 任意数据类型
    },
    // 主进程
    mainServer: {
      // 协议：file://
      protocol: 'file://',
      // 前端资源入口文件
      indexPath: '/public/dist/index.html',
      // 兼容electron参数
      // https://www.electronjs.org/zh/docs/latest/api/browser-window#winloadurlurl-options
      options: {},
      // 加载一个loading页，一般不用开启
      loadingPage: '/public/html/loading.html',
      // 接管。如果想加载一个go web程序，来替代 protocol
      // takeover: 'go',
      channelSeparator: '/', // 通信频道路径分割符，v4 版本后，默认为 /
    }
  }
}
