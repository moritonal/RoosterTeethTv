import Vue from 'vue'
import VueRouter from 'vue-router'

import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import App from './app.vue'

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    {
        path: '/',
        name: "login",
        component: async () => await import("./login.vue"),
        meta: {
            title: "RoosterTV - Login",
            metaTags: [
                {
                    name: 'description',
                    content: 'Login page for RoosterTV.'
                }
            ]
        }
    },
    {
        path: '/videos',
        component: async () => await import("./videos.vue"),
        meta: {
            title: "RoosterTV - Videos",
            metaTags: [
                {
                    name: 'description',
                    content: 'Recent videos by RoosterTeeth.'
                }
            ]
        }
    },
    {
        path: '/player/:slug',
        name: "player",
        component: async () => await import("./player.vue"),
        meta: {
            title: "RoosterTV - Video",
            metaTags: [
                {
                    name: 'description',
                    content: 'Watch a specific video.'
                },
                {
                    name: "robots",
                    content: "noindex,nofollow"
                }
            ]
        }
    }
]


// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
    routes // short for `routes: routes`
});

// This callback runs before every route change, including on page load.
router.beforeEach((to, from, next) => {
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
    const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);

    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);
    const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) document.title = nearestWithTitle.meta.title;

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode.removeChild(el));

    // Skip rendering meta tags if there are none.
    if (!nearestWithMeta) return next();

    // Turn the meta tag definitions into actual elements in the head.
    nearestWithMeta.meta.metaTags.map(tagDef => {
        const tag = document.createElement('meta');

        Object.keys(tagDef).forEach(key => {
            tag.setAttribute(key, tagDef[key]);
        });

        // We use this to track which meta tags we create, so we don't interfere with other ones.
        tag.setAttribute('data-vue-router-controlled', '');

        return tag;
    })
        // Add the meta tags to the document head.
        .forEach(tag => document.head.appendChild(tag));

    next();
});

const root = new Vue({
    router: router,
    render: h => h(App)
}).$mount('#app')