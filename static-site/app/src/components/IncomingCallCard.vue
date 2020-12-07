<script>
import axios from '../axios'
import { handleError } from '../handleErrors'

export default {
  name: 'IncomingCallCard',
  data: () => ({
    call: null
  }),
  props: {
    callId: {
      type: String,
      default: ''
    }
  },
  watch: {
    callId(newVal, oldVal) {
      if(newVal !== oldVal) {
        this.loadCallInfo();
      }
    }
  },
  methods: {
    async loadCallInfo() {
      try {
        if(this.callId !== null && this.callId !== '') {
          const result = await axios.get(`calls/${this.callId}`);

          if(result.data) {
            this.call = result.data
          } 
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    }
  }
}
</script>

<template>
  <b-card class="mt-3" title="Incoming Call">
    <b-overlay>
      <b-form>
        <h5 class="text-left">Caller Information</h5>
        <b-table-simple v-if="call !== null">
          <b-tr>
            <b-th>From</b-th>
            <b-td>{{ call.fromData.from }}</b-td>
          </b-tr>
          <b-tr>
            <b-th>City</b-th>
            <b-td>{{ call.fromData.city }}</b-td>
          </b-tr>
          <b-tr>
            <b-th>Country</b-th>
            <b-td>{{ call.fromData.country }}</b-td>
          </b-tr>
          <b-tr>
            <b-th>State</b-th>
            <b-td>{{ call.fromData.state }}</b-td>
          </b-tr>
          <b-tr>
            <b-th>Zip</b-th>
            <b-td>{{ call.fromData.zip }}</b-td>
          </b-tr>
        </b-table-simple>
      </b-form>
      <hr>
      <b-alert class="mt-5" show variant="info">
        Call status
      </b-alert>
    </b-overlay>
  </b-card>
</template>