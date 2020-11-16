<script>
import axios from '../../axios'
import moment from 'moment'
import UserCreateForm from '../../components/UserCreateForm'
import UserUpdateForm from '../../components/UserUpdateForm'
import { handleError } from '../../handleErrors'

export default {
    name: 'Users',
    components: {
        UserCreateForm,
        UserUpdateForm,
    },
    data() {
        return {
            usersList: [],
            userId: '',
            showModal: false,
            columns: [
                {
                    label: 'Id',
                    field: 'id',
                    hidden: true
                },
                {
                    label: 'Name',
                    field: this.fullNameFn
                },
                {
                    label: 'Email',
                    field: 'email'
                },
                {
                    label: 'Phone Number',
                    field: 'phoneNumber',
                    formatFn: this.formatPhone
                },
                {
                    label: 'Admin',
                    field: 'isAdmin',
                    formatFn: this.formatIsAdmin
                },
                {
                    label: 'Created At',
                    field: 'createdAt',
                    formatFn: this.formatDate
                },
                {
                    label: 'Action',
                    field: 'action'
                }
            ],
            paginationOptions: {
                enabled: true,
                mode: 'records',
                perPage: 10,
                position: 'bottom'
            },
            searchOptions: {
                enabled: true,
                skipDiacritics: true,
                placeholder: 'Search for a User'
            }
        }
    },
    methods: {
        async getUsers() {
            try {
                const result = await axios.get('/users')

                if(result.data) {
                    this.usersList = result.data
                }
            } catch (error) {
                handleError(error, this, 'danger');
            }
        },
        fullNameFn(row){
            return `${row.name} ${row.lastName}`
        },
        formatPhone(value){
            return value ? value : 'no number'
        },
        formatIsAdmin(value) {
            return value ? 'Admin' : 'User';
        },
        formatDate(value) {
            return moment(value).format('MMMM Do YYYY, h:mm:ss a')
        },
        userCreated() {
            this.getUsers()
        },
        userUpdated() {
            this.showModal = false
            this.userId = ''
        },
        editUser(id) {
            this.userId = id
            this.showModal = true
        }
    },
    created() {
        this.getUsers()
    }
}
</script>

<template>
    <b-container>
        <div id="create-user-section" class="mb-4">
            <div class="d-flex mb-3">
                <h3 class="d-inline-block">Create User <b-button variant="link" class="d-inline-block" size="sm" v-b-toggle.create-user><b-icon-plus-circle></b-icon-plus-circle></b-button></h3>
            </div>
            <b-collapse id="create-user">
                <b-card>
                    <user-create-form @onSubmitted="userCreated" />
                </b-card>
            </b-collapse>
        </div>
        <div id="search-for-section">
            <div class="d-flex">
                <h3>Search for a User</h3>
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
                            <b-button @click="editUser(props.row.id)" variant="link">
                                <b-icon-pencil></b-icon-pencil>
                            </b-button>
                        </span>
                        <span v-else>
                            {{props.formattedRow[props.column.field]}}
                        </span>
                    </template>
                </vue-good-table>
            </div>
        </div>
        <user-update-form :id="userId" :show="showModal" @onSubmitted="userUpdated" @onClose="userUpdated" />
    </b-container>
</template>