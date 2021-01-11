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
        meta: {
          is_admin: true // protects admin views from normal users
        },
        component: () => import('../views/pages/Users')
      },
      {
        path: '/numbers',
        name: 'numbers',
        component: () => import('../views/pages/Numbers')
      },
      {
        path: '/departments',
        name: 'departments',
        component: () => import('../views/pages/Deparments'),
        meta: {
          is_admin: true // protects admin views from normal users
        },
      },
      {
        path: '/contacts',
        name: 'contacts',
        component: () => import('../views/pages/Contacts'),
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

const hasPermissions = (to) => {
  if (to.meta.is_admin) {
    if (store.getters.isAdmin) {
      return true
    }

    return false
  }

  // not for admins so user has permission
  return true
}

router.beforeEach((to, from, next) => {
  if (to.name === 'login') {
    if (store.getters.isAuthenticated) {
      next({ name: 'home' })
    }
    else {
      next()
    }
  }
  else {
    if (store.getters.isAuthenticated) {
      if (hasPermissions(to)) {
        next()
      }
      else {
        next({ name: 'home' })
      }
    }
    else {
      next({ name: 'login' })
    }
  }
})

export default router
