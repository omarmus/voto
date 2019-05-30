import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Total from './views/Total.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/pregunta/:key',
      name: 'pregunta',
      component: Home
    },
    {
      path: '/respuesta/:key',
      name: 'respuesta',
      component: Total
    }
  ]
})
