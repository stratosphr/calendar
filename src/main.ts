import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue     from 'vue'
import App     from './App.vue'
import vuetify from './plugins/vuetify'
import './registerServiceWorker'
import router  from './router'
import store   from './store'

Vue.config.productionTip = false

const ignoreWarnMessage = 'The .native modifier for v-on is only valid on components but it was used on <div>.'
Vue.config.warnHandler = function (msg, vm, trace) {
    if (msg === ignoreWarnMessage) {
        // @ts-ignore
        msg = null
        // @ts-ignore
        vm = null
        // @ts-ignore
        trace = null
    }
}

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')
