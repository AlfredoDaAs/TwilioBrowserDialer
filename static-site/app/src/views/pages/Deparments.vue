<script>
import axios from "../../axios";
import DeparmentsCreateForm from "../../components/DeparmentsCreateForm";
import { handleError } from "../../handleErrors";
import DepartmentDeleteForm from '../../components/DepartmentDeleteForm';

export default {
  name: "Deparments",
  components: {
    DeparmentsCreateForm,
    DepartmentDeleteForm,
  },
  data() {
    return {
      showDelModal: false,
      department: null,
      departments: [],
      columns: [
        {
          label: "Deparment",
          field: "name",
        },
        {
          label: "Created At",
          field: "createdAt",
          type: 'date',
          dateInputFormat: 'T',
          dateOutputFormat: 'MMMM do yyyy, h:mm:ss a'
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
    async loadDepartments() {
      try {
        const result = await axios.get('/departments');

        if(result.data) {
          this.departments = result.data
        }
      } catch (error) {
        handleError(error, this, 'danger')
      }
    },
    handleDelete(department) {
      this.department = department
      this.showDelModal = true
    },
    onDelete() {
      this.loadDepartments();
      this.hideDelModal();
    },
    hideDelModal() {
      this.showDelModal =  false
      this.department = {}
    }
  },
  mounted() {
    this.loadDepartments();
  }
};
</script>

<template>
  <b-container>
    <department-delete-form :show="showDelModal" :department="department ? department : {}" @onDelete="onDelete" @onCancel="hideDelModal" />
    <b-card title="Departments">
      <b-row>
        <b-col md="6">
          <deparments-create-form @onCreate="loadDepartments()" />
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
            <b-button
              @click="handleDelete(props.row)"
              variant="link"
            >
              <b-icon-trash></b-icon-trash>
            </b-button>
          </span>
          <span v-else>
            {{ props.formattedRow[props.column.field] }}
          </span>
        </template>
      </vue-good-table>
    </b-card>
  </b-container>
</template>