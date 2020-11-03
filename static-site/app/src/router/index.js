import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/pages/Home.vue'

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

export default router
