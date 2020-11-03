<script>
export default {
    namee: 'Users'
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
                    create user form
                </b-card>
            </b-collapse>
        </div>
        <div id="search-for-section">
            <div class="d-flex">
                <h3>Search for a User</h3>
            </div>
            <div>
                // will display a datatable
            </div>
        </div>
    </b-container>
</template>