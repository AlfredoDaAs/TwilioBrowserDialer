import axios from '../axios'
import { initWorker } from '../twilio'

const state = {
  worker: null,
  available: false,
  activity: 'Offline',
  reservation: null
}

const actions = {
  initWorker: async ({ commit }, token) => {
    const worker = initWorker(token)
    commit('saveWorker', worker)
  },
  updateActivity: async ({ commit }, activity) => {
    const result = await axios.post(`/taskRouter/worker/activity/${activity}`)

    if(result.data) commit('updateActivity', activity)
  },
  completeTask: async ({ commit }, taskSid) => {
    const result = await axios.post(`taskRouter/task/${taskSid}/status`)
  }
}

const mutations = {
  saveWorker: (state, worker) => {
    state.worker = worker
  },
  updateActivity: (state, activity) => {
    state.activity = activity
  }
}

const getters = {
  getWorker: (state) => {
    return state.worker
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}