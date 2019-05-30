import Vue from 'vue'
import firebase from 'firebase/app'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

var firebaseConfig = {
  apiKey: 'AIzaSyCf7bWJAC9gmYGW6o9rNPXbuKxsEhrj5Tg',
  authDomain: 'voto-a3d69.firebaseapp.com',
  databaseURL: 'https://voto-a3d69.firebaseio.com',
  projectId: 'voto-a3d69',
  storageBucket: 'voto-a3d69.appspot.com',
  messagingSenderId: '708639101213',
  appId: '1:708639101213:web:97b30cfd22756046'
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
