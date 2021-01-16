<script>
import axios from "../../axios";
import ContactCreateForm from '../../components/ContactCreateForm';
import ContactDeleteForm from '../../components/ContactDeleteForm';
import ContactEditForm from '../../components/ContactEditForm';
import { handleError } from "../../handleErrors";

export default {
  components: { ContactEditForm, ContactDeleteForm, ContactCreateForm },
  name: 'Contacts',
  data() {
    return {
      createModal: false,
      editModal: false,
      deleteModal: false,
      selectedContact: {},
      columns: [
        {
          label: "Full Name",
          field: this.fullNameFn
        },
        {
          label: "Phone Number",
          field: "phoneNumber"
        },
        {
          label: "Company",
          field: "company"
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
      contacts: [],
      paginationOptions: {
        enabled: true,
        mode: "records",
        perPage: 10,
        position: "bottom",
      },
      searchOptions: {
        enabled: true,
        skipDiacritics: true,
        placeholder: "Search for Contact",
      },
    }
  },
  methods: {
    fullNameFn(row) {
      return `${row.firstName} ${row.lastName}`
    },
    async getContacts() {
      try {
        const result = await axios.get("/contacts");

        if (result.data) {
          this.contacts = result.data;
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    deleteContact(contact) {
      this.selectedContact = contact
      this.deleteModal = true
    },
    editContact(contact) {
      this.selectedContact = contact
      this.editModal = true
    },
    onEditClose() {
      this.selectedContact = {}
      this.editModal = false
    },
    onEditSubmit() {
      this.onEditClose();
      this.getContacts();
    },
    onDeleteClose() {
      this.selectedContact = {}
      this.deleteModal = false
    },
    onDeleteSubmit() {
      this.onEditClose();
      this.getContacts();
    },
    onCreateClose() {
      this.createModal = false
    },
    onCreateSubmit() {
      this.onCreateClose()
      this.getContacts();
    }
  },
  mounted() {
    this.getContacts();
  }
}
</script>

<template>
  <b-container fluid>
    <div class="d-flex mb-3">
      <h3 class="d-inline-block">
        Contacts
        <b-button
          variant="link"
          class="d-inline-block"
          size="sm"
          @click="createModal = true"
        >
          <b-icon-plus-circle></b-icon-plus-circle>
        </b-button>
      </h3>
    </div>
    <vue-good-table
      :columns="columns"
      :rows="contacts"
      :pagination-options="paginationOptions"
      :search-options="searchOptions"
    >
      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'action'">
          <b-button size="sm" @click="editContact(props.row)" variant="link">
            <b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button size="sm" variant="link" @click="deleteContact(props.row)">
            <b-icon-trash></b-icon-trash>
          </b-button>
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>
    <contact-create-form :show="createModal" @onClose="onCreateClose" @onSubmitted="onCreateSubmit" />
    <contact-edit-form :contact="selectedContact" :show="editModal" @onClose="onEditClose" @onSubmitted="onEditSubmit" />
    <contact-delete-form :contact="selectedContact" :show="deleteModal" @onClose="onDeleteClose" @onSubmitted="onDeleteSubmit" />
  </b-container>
</template>