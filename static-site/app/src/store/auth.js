import axios from '../axios'
import firebase from "firebase/app";
import { isOnlineForDatabase, isOfflineForDatabase } from '../firebase'
import { destroyDevice } from '../twilio'

const state = {
    token: null,
    id: null,
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
                await firebase.database().ref(`users/${data.id}`).update({
                    ...isOnlineForDatabase,
                    name: data.name
                })
                commit('loginSuccess', data)
            }
        } catch (error) {
            commit('loginError', error.message)
        }
    },

    logout: async ({ commit, state }) => {
        await firebase.database().ref(`users/${state.id}`).update(isOfflineForDatabase)
        destroyDevice()
        commit('logout')
    }
}

const mutations = {
    loginSuccess: (state, payload) => {
        state.token = payload.token
        state.id = payload.id
        state.name = payload.name
        state.email = payload.email
        state.isAdmin = payload.isAdmin
    },
    loginError: (state, error) => {
        state.error = error
    },
    logout: (state) => {
        state.token = null
        state.id = null
        state.name = null
        state.email = null
        state.isAdmin = false
    }
}

const getters = {
    getToken: (state) => {
        return state.token ? state.token : '';
    },

    getUserId: (state) => {
        return state.id ? state.id : ''
    },

    isAuthenticated: (state) => {
        return state.token !== null && state.token !== '' ? true : false;
    },

    isAdmin: (state) => {
        return state.isAdmin ? true : false;
    },

    getName: (state) => {
        return state.name && state.name.length > 0 ? `Welcome ${state.name}!` : 'User';
    }
}

export default {
    state,
    actions,
    mutations,
    getters
}