<script>
import axios from "../../axios";
import UserCreateForm from "../../components/UserCreateForm";
import UserUpdateForm from "../../components/UserUpdateForm";
import UserDeleteForm from "../../components/UserDeleteForm";
import { handleError, handleMessage } from "../../handleErrors";
import { mapGetters } from "vuex";

export default {
  name: "Users",
  components: {
    UserCreateForm,
    UserUpdateForm,
    UserDeleteForm,
  },
  computed: mapGetters(["getUserId", "isAdmin"]),
  data() {
    return {
      updatingWorkers: false,
      departments: [],
      usersList: [],
      userId: "",
      showEditModal: false,
      showDelModal: false,
      columns: [
        {
          label: "Id",
          field: "id",
          hidden: true,
        },
        {
          label: "Name",
          field: this.fullNameFn,
        },
        {
          label: "Email",
          field: "email",
        },
        {
          label: "Departments",
          field: "departments",
          formatFn: this.formatDepts,
        },
        {
          label: "Phone Number",
          field: "phoneNumber",
          formatFn: this.formatPhone,
        },
        {
          label: "Admin",
          field: "isAdmin",
          formatFn: this.formatIsAdmin,
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
        placeholder: "Search for a User",
      },
    };
  },
  methods: {
    async getUsers() {
      try {
        const result = await axios.get("/users");

        if (result.data) {
          this.usersList = result.data;
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    fullNameFn(row) {
      return `${row.name} ${row.lastName}`;
    },
    formatPhone(value) {
      return value ? value : "no number";
    },
    formatIsAdmin(value) {
      return value ? "Admin" : "User";
    },
    formatDepts(value) {
      let depts = ""
      const size = value.length;
      value.forEach((dept, i) => {
        if(i < (size - 1)){
          depts += `${dept}, `
        } else {
          depts += `${dept}`
        }
      })
      return depts
    },
    userCreated() {
      this.getUsers();
    },
    userUpdated() {
      this.showEditModal = false;
      this.userId = "";
    },
    editUser(id) {
      this.userId = id;
      this.showEditModal = true;
    },
    deleteUser(id) {
      this.userId = id;
      this.$nextTick(() => {
        this.showDelModal = true;
      });
    },
    userDeleted() {
      this.cancelDelete();
      this.$nextTick(() => {
        this.getUsers();
      });
    },
    cancelDelete() {
      this.showDelModal = false;
      this.$nextTick(() => {
        this.userId = "";
      });
    },
    async updateWorkers() {
      try {
        this.updatingWorkers = true;
        const result = await axios.post('/taskRouter/updateWorkers');

        this.updatingWorkers = false;
        if(result.data) {
          handleMessage('Workers updated!', this, 'success');
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    }
  },
  created() {
    this.getUsers();
  },
};
</script>

<template>
  <b-container fluid>
    <div class="d-flex mb-3">
      <b-card class="text-left">
        <p>Script to update or generate a Worker related to each Agent, this will allow Twilio Task Router to send calls to connected Agents</p>
        <b-button @click="updateWorkers" :disabled="updatingWorkers" variant="outline-info">
          <b-spinner v-if="updatingWorkers" small></b-spinner>
          Update Twilio Workers
        </b-button>
      </b-card>
    </div>
    <user-create-form @onSubmitted="userCreated" />
    <div id="search-for-section">
      <div class="d-flex">
        <h3>Users</h3>
      </div>
      <div>
        <vue-good-table
          :columns="columns"
          :rows="usersList"
          :pagination-options="paginationOptions"
          :search-options="searchOptions"
        >
          <template slot="table-row" slot-scope="props">
            <span v-if="props.column.field == 'action'">
              <b-button size="sm" @click="editUser(props.row.id)" variant="link">
                <b-icon-pencil></b-icon-pencil>
              </b-button>
              <b-button
                v-if="props.row.id !== getUserId"
                @click="deleteUser(props.row.id)"
                variant="link"
                size="sm"
              >
                <b-icon-trash></b-icon-trash>
              </b-button>
            </span>
            <span v-else>
              {{ props.formattedRow[props.column.field] }}
            </span>
          </template>
        </vue-good-table>
      </div>
    </div>
    <user-update-form
      :id="userId"
      :show="showEditModal"
      @onSubmitted="userUpdated"
      @onClose="userUpdated"
    />
    <user-delete-form
      :id="userId"
      :show="showDelModal"
      @onDeleted="userDeleted"
      @onClose="cancelDelete"
    />
  </b-container>
</template>