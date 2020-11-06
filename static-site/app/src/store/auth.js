import axios from '../axios'

const state = {
    user: null,
    error: null
}

const actions = {
    authenticate: async ({ commit }, token) => {
        try {
            const response = axios.post('/auth', {
                token: token
            })

            console.log('data', response.data);
            if(response.data && response.data.status === 'ok') {
                commit('loginSuccess', response.data.user)
            }
        } catch (error) {
            commit('loginError', error.message)
        }
    }
}

const mutations = {
    loginSuccess: (state, payload) => {
        state.user = payload
    },
    loginError: (state, error) => {
        state.error = error
    }
}

const getters = {}

export default {
    state,
    actions,
    mutations,
    getters
}