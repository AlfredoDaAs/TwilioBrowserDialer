<script>
import axios from "../../axios";
import DeparmentsCreateForm from "../../components/DeparmentsCreateForm";
import { handleMessage, handleError } from "../../handleErrors";
import DepartmentDeleteForm from '../../components/DepartmentDeleteForm';

export default {
  name: "Deparments",
  components: {
    DeparmentsCreateForm,
    DepartmentDeleteForm,
  },
  data() {
    return {
      creatingTQs: false,
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
    },
    async createTaskQueues() {
      try {
        this.creatingTQs = true;
        const result = await axios.post('/taskRouter/batch/taskQueue');

        this.creatingTQs = false;
        if(result.data) {
          const created = result.data.created
          handleMessage(`${created} TaskQueues created`, this, 'success');
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    }
  },
  mounted() {
    this.loadDepartments();
  }
};
</script>

<template>
  <b-container fluid>
    <div class="d-flex mb-3">
      <b-card class="text-left">
        <p>Script to generate a TaskQueue for each department</p>
        <b-button @click="createTaskQueues" :disabled="creatingTQs" variant="outline-info">
          <b-spinner v-if="creatingTQs" small></b-spinner>
          Create TaskQueues
        </b-button>
      </b-card>
    </div>
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