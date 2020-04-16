module.exports = {
  devServer: {
    proxy: {
      '/stats.json': {
        //要访问的跨域的域名
        target: 'http://192.168.2.245:3000/',
        ws: false, // 是否启用websockets
        secure: false, // 使用的是http协议则设置为false，https协议则设置为true
        //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样客户端端和服务端进行数据的交互就不会有跨域问题
        changOrigin: true,
      }
    }
  },
  lintOnSave: false,
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  }
}

