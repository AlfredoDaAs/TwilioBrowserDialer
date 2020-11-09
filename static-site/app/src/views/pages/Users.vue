<script>
import axios from '../../axios'
import moment from 'moment'
import UserCreateForm from '../../components/UserCreateForm'

export default {
    name: 'Users',
    components: {
        UserCreateForm
    },
    data() {
        return {
            usersList: [],
            columns: [
                {
                    label: 'Id',
                    field: 'id',
                    hidden: true
                },
                {
                    label: 'Name',
                    field: 'name'
                },
                {
                    label: 'Email',
                    field: 'email'
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
                console.log(error.message);
            }
        },
        formatIsAdmin(value) {
            return value ? 'Admin' : 'User';
        },
        formatDate(value) {
            return moment(value).format('MMMM Do YYYY, h:mm:ss a')
        },
        userCreated() {
            this.getUsers()
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
                <h3 class="d-inline-block">Create User <b-button class="d-inline-block" size="sm" v-b-toggle.create-user pill variant="outline-warning"><b-icon-plus-circle></b-icon-plus-circle></b-button></h3>
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
                />
            </div>
        </div>
    </b-container>
</template>