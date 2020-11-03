import { initDevice } from '../twilio'

const state = {
    token: null
}

const actions = {
    setToken: ({ commit }, token) => {
        initDevice(token)
        commit('registerToken', token)
    }
}

const mutations = {
    registerToken: (state, token) => {
        state.token = token
    }
}

const getters = {}

export default {
    state,
    actions,
    mutations,
    getters
}