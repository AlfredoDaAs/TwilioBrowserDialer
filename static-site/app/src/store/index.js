import Vue from 'vue'
import Vuex from 'vuex'

import token from './token'
import auth from './auth'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    token,
    auth
  }
})
