import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/pages/Home.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        children: [
            {
                path: '/calls',
                name: 'calls',
                component: () => import('../views/pages/Calls')
            },
            {
                path: '/users',
                name: 'users',
                component: () => import('../views/pages/Users')
            }
        ]
    },
    {
        path: '/sessions',
        component: () => import('../views/sessions'),
        redirect: '/sessions/login',
        children: [
            {
                path: '/login',
                name: 'login',
                component: () => import('../views/sessions/login')
            }
        ]
    },
    {
        path: "*",
        component: () => import("../views/pages/notFound")
    }
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if(to.name === 'login') {
        if(store.getters.isAuthenticated) {
            next({ name: 'home' })
        }
        else {
            next()
        }
    }
    else {
        if(store.getters.isAuthenticated) {
            next()
        }
        else {
            next({ name: 'login' })
        }
    }
})

export default router
