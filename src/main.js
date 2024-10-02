import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'


window.API_BASE_URL_REMOTE = "https://traders.projectyokkasoe.org/api/stats/"
//window.API_BASE_URL_REMOTE = "http://traders-compose.eba-ck9vnipp.ap-southeast-1.elasticbeanstalk.com/api/stats/"
window.API_BASE_URL_LOCAL = "/data/fakeapi/"

const API_MODE = "remote";

//window.API_BASE_URL = "/data/fakeapi/"
window.getApiUrl = ( path )=>{
  if( API_MODE == "local" ){
    return window.API_BASE_URL_LOCAL + path + '.json';
  }else{
    return window.API_BASE_URL_REMOTE + path;
  }
}
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
