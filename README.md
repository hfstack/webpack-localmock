# 使用指南

## 功能
1. 支持接口自动创建。根据接口url路径在本地创建接口响应json文件。
2. 支持接口变量替换。将接口url中的变量通过正则替换为固定值
3. 支持本地mock接口网页端查询修改
4. 支持网页端手动导入接口mock数据

## vue-cli3 中引入

```
1. const localmock = require('webpack-localmock')

2. vue-config.js中新增devServer
commomConfig: {
    ...
    devServer: localmock（{
        port: '7788', //端口号
        mockDir: 'mock', // response json 文件所在目录
        proxyToken: 'api' //本地api接口前缀
        
    }）
}

```
## 接口响应数据修改
json文件修改主要通过两种方式  
1. 根据接口url路径找到对应本地json文件修改
2. 打开浏览器访问http://ip:port/localmock

![image](https://etreaty.oss-cn-hangzhou.aliyuncs.com/skyeye/static/image/localmock2.png)

