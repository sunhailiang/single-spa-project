# 微前端single-spa的实践
- 创建项目vue create [single-spa]
   - 安装vue-router
   `cnpm i vue-router`
   - main.js 
      - `import VueRouter from 'vue-router'`
      - `Vue.use(VueRouter)`
   - 新建路由管理router/index.js
   ```js
      const routes = [
      //  { path: '/vue', component: COM }
       ]
      // 导出router对象
      export const router = new VueRouter({
       routes // (缩写) 相当于 routes: routes
      })
   ```
   - main.js 注册路由
   ```js
      new Vue({
        router, // 注册路由
        render: h => h(App),
      }).$mount('#app')
   ```
   - 安装antd
   `cnpm i --save ant-design-vue`
   - antd按需加载
      - 使用less，
         - `cnpm i less less-loader --save`
   - 安装按需加载插件
      - `cnpm install babel-plugin-import --save-dev`
   - 添加babel配置  babel.config.js
      ```js
      module.exports = {
        presets: [
          '@vue/cli-plugin-babel/preset'
        ],
        plugins: [
         [
          'import',
           { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: true }
         ]
        ]
      }
      ```
    - 添加webpack配置，新建vue.condig.js
    ```js
    module.exports = {
      css: {
        loaderOptions: {
      less: {
        javascriptEnabled: true,
        }
       }
     },
    }
    ```  
   - 全局注册Antd组件main.js
   ```js
   import { Button, Input } from "ant-design-vue";
   Vue.use(Input);
   Vue.use(Button);// 使用antd组件
   ```
   - 至此在项目中任何地方都可以引用了
   ```html
     <a-input style="width: calc(100% - 130px)" />
     <a-button>成功了</a-button>
   ```

- 安装single-spa框架
`cnpm i single-spa --save`
- 新建layout/base
- 添加布局组件
- content中写
```html
 <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff',  minHeight: '280px' }">
        <div id="single-vue">
          <div id="vue"></div>
        </div>
      </a-layout-content>
```

## 新建子项目
- `vue create child-project-a`
- `cd  child-project-a`
- 安装支持vue的single-spa包装库
- `cnpm i single-spa-vue --save`
- main.js中使用vue包装库
- `import singleSpaVue from "single-spa-vue"`
- single-spa要求子项目必须导出完整的生命周期，所以我们要进行封装
- main.js
```js
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import singleSpaVue from "single-spa-vue"

Vue.config.productionTip = false;

let option = {
  router,
  store,
  render: h => h(App)
}
const vueLifeCycles = singleSpaVue({
  Vue,
  appOptions: option
})
// 导出子项目生命周期，此处由single-spa的框架进行了一些包装
**注意：常量名称不能变，必须和single中的名称一致**
export const bootstrap = vueLifeCycles.bootstrap
export const mount = vueLifeCycles.mount
export const unmount = vueLifeCycles.unmount

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount("#app");

```
- 修改子项目的端口然后启动
`  "serve": "vue-cli-service serve --port 3000",`
- 此时分别运行两个项目
- 但是此时两个项目依旧没有什么关系
- 我们把子项目挂载到window上方便父项目引入
- 回到子项目
- 新建vue.config.js
```js
module.exports = {
  configureWebpack: {
    output: {
      library: 'vueChildA', // 给导出项目添加名称
      libraryTarget: 'window' // 导出到哪里，此时挂载到window上
    }
  }
}
```
- 此时就把子项目挂载到window上了，怎么知道挂载成功？
   - 控制台：window.vueChildA
- 以上导出成功了
- 接下来去父级项目引入

- 回到父级项目
   - 注意了这里面我们采用远程方式引入子项目，也比较符合实际需求
   - 怎么导呢？导什么呢？注意了，子项目中将代码打包app.js，我们只要将3000端口下的app.js（NetWork中可以查看）导入是不是就将子项目导入了呢？试试看
   - 新建single.config.js 并且在main.js中引入
   `import './single.config'`
   - single.config.js
   ```js
   import * as singleSpa from 'single-spa'


const runScript = async (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url
    script.onload = resolve
    script.onerror = reject
    const firstScript = document.getElementsByTagName("script")[0]
    firstScript.parentNode.insertBefore(script, firstScript)
  })
}
console.log("ocation.pathname", location.pathname);
singleSpa.registerApplication("vueChildA", async () => {
  console.log("加载成功");

  await runScript('http://192.168.2.245:3000/js/chunk-vendors.js')
  await runScript('http://192.168.2.245:3000/js/app.js')
  return window.vueChildA // 这个就是子项目
}, location => location.pathname.startsWith('/vuechildA'))
singleSpa.start()
   ```
  - 此时运行项目你会发现，子项目的内容出现在父级项目的页面中了
  - NetWork/js你可以看到来自本地的资源和来自子项目的资源
     - 但是位置需要调整一下
# 确认将子项目导入到父级项目的指定的位置
- 在父级项目中指定一个位置并且给id属性
- layout/base.vue
```html
        <div id="single-vue">
          <!-- 注意了这个id必须是子项目中导出的那个el的对应的id，确保子项目存放的位置 -->
          <div id="vueChildA"></div>
        </div>

```
- 子项目的vue.config.js
```js
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import singleSpaVue from "single-spa-vue"

Vue.config.productionTip = false;

let option = {
  el: '#vueChildA', // 这个属性就是确保将子项目导到指定位置
  router,
  store,
  render: h => h(App)
}
const vueLifeCycles = singleSpaVue({
  Vue,
  appOptions: option
})

export const bootstrap = vueLifeCycles.bootstrap
export const mount = vueLifeCycles.mount
export const unmount = vueLifeCycles.unmount
```
## 路由问题
- 此时你去切换路由你会返现切换不了，about.js居然请求了本地端口而不是子项目本身的了
- 怎么办呢？
- 去子项目设置publicPath就可以了
- vue.config.js
```js
module.exports = {
  publicPath: '//192.168.2.245:3000', // 配置所有的资源都走指定地址
  configureWebpack: {
    output: {
      library: 'vueChildA', // 给导出项目添加名称
      libraryTarget: 'window' // 导出到哪里，此时挂载到window上
    }
  }
}
```
## 便捷管理子项目引入
- single.config.js
```js
  await runScript('http://192.168.2.245:3000/js/chunk-vendors.js')
  await runScript('http://192.168.2.245:3000/js/app.js')
  // 你看类似这种，如果我们子项目稍微大点，打包的文件稍微多，那么这个地方就需要单独多次引入么？那么管理起来岂不是很麻烦嘛~
```
- 怎么一劳永逸解决的这个问题，减少维护成本呢？
- 在子项目中安装一个插件 
- cnpm i --save-dev stats-webpack-plugin
- 然后进行webpack配置，vue.config.js
```js
const statsPlugin = require("stats-webpack-plugin")
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
```
> 此时打包，会在dist中出现一个stats.json，文件包含了所有依赖的资源
- 既然子项目有了这个一个依赖包
- 只要在父级项目中直接请求过来就可以了
`cnpm i axios --save`
- single.config.js
```js
import axios from 'axios'
const getManifest = (url, bundle) => new Promise(async (resolve) => {
  // 注意了直接这样请求会有跨域问题
  const { data } = await axios.get(url)
  const { entrypoints, publicPath } = data
  const assets = entrypoints[bundle].assets
  for (let i = 0; i < assets.length; i++) {
    await runScript(publicPath + assets[i]).then(() => {
      if (i === assets.length - 1) {
        resolve()
      }
    })
  }
})
singleSpa.registerApplication("vueChildA", async () => {
  let vueChildA = null
  // 这个json请求的子项目，存在跨域问题我们采用代理
  await getManifest("/stats.json", 'app').then(() => {
    vueChildA = window.vueChildA
  })
  return vueChildA // 这个就是子项目
}, location => location.pathname.startsWith('/vuechildA'))
singleSpa.start()
```
- 解决跨域问题
   - vue.config.js
```js
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
  }
}
```
- 如果还有问题需要注意下async await的顺序
- 运行项目就可以拿到子项目的资源包了

# 样式隔离
- 也就是项目之间样式隔离，在项目类名之前加统一前缀
- 子项目
 - 安装antd
   `cnpm i --save ant-design-vue`
   - antd按需加载
      - 使用less，
         - `cnpm i less less-loader --save`
   - 安装按需加载插件
      - `cnpm install babel-plugin-import --save-dev`
   - 添加babel配置  babel.config.js
      ```js
      module.exports = {
        presets: [
          '@vue/cli-plugin-babel/preset'
        ],
        plugins: [
         [
          'import',
           { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: true }
         ]
        ]
      }
      ```
    - 添加webpack配置，新建vue.condig.js
    ```js
    module.exports = {
      css: {
        loaderOptions: {
      less: {
        javascriptEnabled: true,
        }
       }
     },
    }
    ```  
   - 全局注册Antd组件main.js
   ```js
   import { Button, Input } from "ant-design-vue";
   Vue.use(Input);
   Vue.use(Button);// 使用antd组件
   ```
   - 至此在项目中任何地方都可以引用了
   ```html
     <a-input style="width: calc(100% - 130px)" />
     <a-button>成功了</a-button>
   ```
- 项目安装样式隔离插件
`cnpm i postcss-selector-namespace --save-dev`
- 新建posecss.config.js
```js
module.exports = {
  plugins: {
    "postcss-selector-namespace": {
      namespace (css) {
        return "#vueChildA" // 这个前缀必须是真实存在的id或者类名
      }
    }
  }
}
```
- 保存刷新去页面中看看，此时子项目的类名前就添加了#vueChildA
# 独立运行
- 大家可能会发现，我们的子服务现在是无法独立运行的，现在我们改造为可以独立 + 集成双模式运行。
- single-spa 有个属性，叫做 window.singleSpaNavigate。如果为true，代表就是single-spa模式。如果false，就可以独立渲染。
- 我们改造一下子项目的main.js ：

- main.js
```js
const vueOptions = {
  el: "#vue",
  router,
  render: h => h(App)
};

/**** 添加这里 ****/
if (!window.singleSpaNavigate) { // 如果不是single-spa模式
  delete vueOptions.el;
  new Vue(vueOptions).$mount('#vue');
}
/**** 结束 ****/

// singleSpaVue包装一个vue微前端服务对象
const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: vueOptions
});
```
- 这样，我们就可以独立访问子服务的 index.html 。不要忘记在public/index.html里面添加命名空间，否则会丢失样式。
```html
<div class="single-spa-vue">
    <div id="app"></div>
</div>
```

# 父->子项目传参
- 父级项目在注册子项目时有四个参数
- single-config.js
```js
singleSpa.registerApplication("vueChildA", async () => {
  console.log("加载成功");
  let vueChildA = null
  await getManifest("/stats.json", 'app').then(() => {
    vueChildA = window.vueChildA
  })
  return vueChildA // 这个就是子项目
}, location => location.pathname.startsWith('/vuechildA'), { authToken: "d83jD63UdZ6RS6f70D0" }) // 注意了，最后这个对象就是传递参数
// 最后这个{ authToken: "d83jD63UdZ6RS6f70D0" } 对象就可以讲
singleSpa.start()
```
- 子项目中修改
```js
// export const mount = vueLifeCycles.mount
 export function mount (props) {
  console.log("啥几码？", props); // 可以在 app1 中获取到authToken参数
  return vueLifeCycles.mount(props);
}
```

