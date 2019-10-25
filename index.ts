import Vue from 'vue'
import VueRouter from 'vue-router'

import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)
Vue.use(VueRouter)

const Foo = { template: '<div>foo</div>' }

import App from './app.vue'
import Player from './player.vue'
import Videos from './videos.vue'
import Login from "./login.vue"

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { path: '/', component: Login },
    { path: '/videos', component: Videos },
    { path: '/player/:slug', name: "player", component: Player }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
    routes // short for `routes: routes`
})


const root = new Vue({
    router: router,
    // template: "<div>test</div>"
    render: h => h(App)
}).$mount('#app')