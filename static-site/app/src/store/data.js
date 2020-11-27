import axios from '../axios'

const state = {
  departments: [],
  error: null,
}

const actions = {
  loadContent: async ({ commit }) => {
    try {
      const departments = (await axios.get('/departments')).data

      commit('loadDepartments', departments);
    } catch (error) {
      commit('dataError', error.message);
    }
  }
}

const mutations = {
  loadDepartments: (state, departments) => {
    state.departments = departments
  },

  dataError: (state, message) => {
    state.error = message
  }
}

const getters = {
  getDepartments: (state) => {
    return state.departments
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}