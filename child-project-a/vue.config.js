const statsPlugin = require("stats-webpack-plugin")
module.exports = {
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  },
  publicPath: '//192.168.2.245:3000',
  configureWebpack: {
    output: {
      library: 'vueChildA', // 给导出项目添加名称
      libraryTarget: 'window' // 导出到哪里，此时挂载到window上
    },
    plugins: [
      new statsPlugin('stats.json', {
        chunkModules: false,
        entryPoints: true,
        source: false,
        chunks: false,
        modules: false,
        assets: false,
        children: false,
        exclude: [/node_modules/]
      })
    ]
  }
}