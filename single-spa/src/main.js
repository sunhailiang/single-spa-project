import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { router } from './router'
import { Button, Input, Layout, Menu, Icon } from "ant-design-vue";
import './single.config'
Vue.use(Icon);
Vue.use(Menu);
Vue.use(Layout);
Vue.use(Input);
Vue.use(Button);// 使用antd组件

Vue.config.productionTip = false
Vue.use(VueRouter) // 使用VueRouter
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
