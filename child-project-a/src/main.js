import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import singleSpaVue from "single-spa-vue"
import { Button, Input } from "ant-design-vue";
Vue.use(Input);
Vue.use(Button);// 使用antd组件

Vue.config.productionTip = false;

let option = {
  el: '#vueChildA',
  router,
  store,
  render: h => h(App)
}
if (!window.singleSpaNavigate) { // 如果不是single-spa模式
  delete option.el;
  new Vue(option).$mount('#app');
}

const vueLifeCycles = singleSpaVue({
  Vue,
  appOptions: option
})

export const bootstrap = vueLifeCycles.bootstrap
export const mount = vueLifeCycles.mount
export const unmount = vueLifeCycles.unmount



// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount("#app");
