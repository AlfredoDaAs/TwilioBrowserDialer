<script>
import axios from '../axios'
import { handleError } from '../handleErrors'

export default {
  name: 'CallStatus',
  data: () => ({
    isAvailable: false,
    isLoading: false,
  }),
  props: {
    available: {
      type: Boolean,
      default: false
    },
    activity: {
      type: String,
      default: 'Offline'
    }
  },
  watch: {
    available(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.isAvailable = newVal
      }
    }
  },
  methods: {
    async updateActivity(activity) {
      try {
        this.isLoading = true
        await axios.post(`/taskRouter/worker/activity/${activity}`)
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        handleError(error, this, "danger");
      }
    },
  }
}
</script>

<template>
  <div class="d-flex mb-3">
    <h5>Agent status: </h5>
    <b-form-checkbox class="ml-2" disabled v-model="isAvailable" name="check-button" switch>
      Available ({{ activity }})
    </b-form-checkbox>
    <b-button :disabled="isLoading" class="mx-2" variant="success" size="sm" v-if="!isAvailable" @click="updateActivity('idle')">
      <b-spinner v-if="isLoading" small></b-spinner>
      Connect
    </b-button>
    <b-button :disabled="isLoading" class="mx-2" variant="danger" size="sm" v-else @click="updateActivity('offline')">
      <b-spinner v-if="isLoading" small></b-spinner>
      Disconnect
    </b-button>
  </div>
</template>