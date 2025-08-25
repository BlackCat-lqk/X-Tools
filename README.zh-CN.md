[![License](https://img.shields.io/badge/License-Apache-blue.svg)](https://gitee.com/dromara/electron-egg/blob/master/LICENSE)

<div align=center>
<h3>🎉🎉🎉 X-Tools v1.0.0 已经发布! 🎉🎉🎉</h3>
</div>
<br>
<div align=center>
<img src="./public/images/example/logo.png" width="150" height="150" />
</div>
<br>
<div align=center>
<h3><strong>描述：基于electron-egg框架开发，前端项目基于vue3.0开发</strong></h3>
</div>
<br>

![](./public/images/example/X-Tools1.png) 
<br>

<div align=center>
欢迎您访问我的博客：https://mixblog.cn/ 
</div>
<br>
![](./public/images/example/mixblog.png)

## 环境准备：
node >= 20.0.0
<br>
Electron = ^31.7.6

## 开发环境启动项目
1.进入前端项目目录 cd .\frontend ，执行npm install
<br>
2.项目根目录下执行 npm install
<br>
3.在前端目录下执行 npm run dev-f，开启渲染进程服务
<br>
4.在项目根目录下执行 npm run dev-e，开启主进程服务

## 两种打包方式：
1. 在根目录直接执行 npm run build（推荐），改方式打包会在打包的时候将代码加密
<br>
2. 在根目录下分别执行 npm run build-frontend 和 npm run build-electron，该方式打包不会加密代码
<br>

## 打包测试：
根目录下执行 npm run start

## 构建可执行文件：
1.构建windows 64位版本：npm run build-w
<br>
2.构建mac版本：npm run build-m
<br>
3.构建Linux版本：npm run build-l
<br>
其它版本构建请自行查看package.json文件

## 打包输出目录：
前端：前端根目录下的dist目录
<br>
electron：项目根目录下的public/dist目录

## 构建文件输出目录：
项目根目录下的out目录