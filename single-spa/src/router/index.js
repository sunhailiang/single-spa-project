import VueRouter from 'vue-router'
import LayOut from '@/layout/base'
const routes = [
  {
    path: '/', component: LayOut,
    children: [
      {
        path: "/vuechildA", name: 'vue'
      }
    ]
  },

]
export const router = new VueRouter({
  mode: 'history',
  routes
})