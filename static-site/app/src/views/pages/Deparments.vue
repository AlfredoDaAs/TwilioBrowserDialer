<script>
import axios from "../../axios";
import moment from "moment";
import DeparmentsCreateForm from "../../components/DeparmentsCreateForm";
import { handleError } from "../../handleErrors";

export default {
  name: "Deparments",
  components: {
    DeparmentsCreateForm,
  },
  data() {
    return {
      departments: [],
      columns: [
        {
          label: "Deparment",
          field: "name",
        },
        {
          label: "Created At",
          field: "createdAt",
          formatFn: this.formatDate,
        },
        {
          label: "Action",
          field: "action",
        },
      ],
      paginationOptions: {
        enabled: true,
        mode: "records",
        perPage: 10,
        position: "bottom",
      },
      searchOptions: {
        enabled: true,
        skipDiacritics: true,
        placeholder: "Search for a Department",
      },
    };
  },
  methods: {
    formatDate(value) {
      return moment(value).format("MMMM Do YYYY, h:mm:ss a");
    },
    async loadDepartments() {
      try {
        const result = await axios.get('/departments');

        if(result.data) {
          this.departments = result.data
        }
      } catch (error) {
        handleError(error, this, 'danger')
      }
    }
  },
  mounted() {
    this.loadDepartments();
  }
};
</script>

<template>
  <b-container>
    <b-card title="Departments">
      <b-row>
        <b-col md="6">
          <deparments-create-form />
        </b-col>
      </b-row>
      <vue-good-table
        class="mt-4"
        :columns="columns"
        :rows="departments"
        :pagination-options="paginationOptions"
        :search-options="searchOptions"
      >
        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'action'">
          </span>
          <span v-else>
            {{ props.formattedRow[props.column.field] }}
          </span>
        </template>
      </vue-good-table>
    </b-card>
  </b-container>
</template>