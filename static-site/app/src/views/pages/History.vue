<script>
import { handleError } from "../../handleErrors";
import axios from "../../axios";

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

export default {
  name: 'CallsHistory',
  data() {
    return {
      calls: [],
      columns: [
        { label: 'From', field: 'from' },
        { label: 'To', field: 'to' },
        { label: 'Direction', field: 'direction' },
        { label: 'Date', field: 'createdAt', type: 'date', dateInputFormat: 'T', dateOutputFormat: 'yyyy-MM-dd hh:mm:ss a' },
        { label: 'Time', field: 'callDuration', formatFn: this.formatCallDuration },
      ],
      paginationOptions: {
        enabled: true,
        mode: "records",
        perPage: 15,
        position: "bottom",
      },
      searchOptions: {
        enabled: true,
        skipDiacritics: true,
        placeholder: "Search for a Call",
      },
    }
  },
  methods: {
    formatCallDuration(duration) {
      if(!duration) return '00:00:00'

      const time = Number(duration)
      const hours = Math.floor(time / 3600)
      const minutes = Math.floor(time / 60)
      const seconds = time % 60;

      return str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
    },
    async getCallsHistory() {
      try {
        const result = await axios.get('/calls');

        if(result.data) {
          this.calls = result.data
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    }
  },
  mounted() {
    this.getCallsHistory()
  }
}
</script>

<template>
  <b-container fluid>
    <h3>
      Calls History
    </h3>
    <vue-good-table
      :columns="columns"
      :rows="calls"
      :pagination-options="paginationOptions"
      :search-options="searchOptions"
    ></vue-good-table>
  </b-container>
</template>