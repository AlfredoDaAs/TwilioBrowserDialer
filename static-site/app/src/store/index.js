import Vue from 'vue'
import Vuex from 'vuex'
import { initDevice } from '../twilio'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
      token: null
  },
  mutations: {
      registerToken: (state, token) => {
          state.token = token
      }
  },
  actions: {
      setToken: ({ commit }, token) => {
          initDevice(token)
          commit('registerToken', token)
      }
  },
  modules: {
  }
})
