'use strict';

/**
 *  coverage config.default.js
 */
module.exports = () => {
  return {
    openDevTools: false,
    // 主进程
    mainServer: {
      // 协议：file://
      protocol: 'file://',
      // 前端资源入口文件
      indexPath: '/public/dist/index.html',
      // 兼容electron参数
      // https://www.electronjs.org/zh/docs/latest/api/browser-window#winloadurlurl-options
      options: {},
    }
  };
};
