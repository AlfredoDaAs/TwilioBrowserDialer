import axios from '../axios'

const state = {
    token: null,
    name: null,
    email: null,
    error: null,
    isAdmin: false
}

const actions = {
    authenticate: async ({ commit }, token) => {
        try {
            const response = await axios.post('/auth', {
                token: token
            })

            const data = response.data
            if(data && data.status === 'ok') {
                commit('loginSuccess', data)
            }
        } catch (error) {
            commit('loginError', error.message)
        }
    },

    logout: ({ commit }) => {
        commit('logout')
    }
}

const mutations = {
    loginSuccess: (state, payload) => {
        state.token = payload.token
        state.name = payload.name
        state.email = payload.email
    },
    loginError: (state, error) => {
        state.error = error
    },
    logout: (state) => {
        state.token = null
        state.name = null
        state.email = null
    }
}

const getters = {
    getToken: (state) => {
        return state.token ? state.token : '';
    },

    isAuthenticated: (state) => {
        return state.token !== null && state.token !== '' ? true : false;
    },

    getName: (state) => {
        return state.name.length > 0 ? `Welcome ${state.name}!` : 'User';
    }
}

export default {
    state,
    actions,
    mutations,
    getters
}