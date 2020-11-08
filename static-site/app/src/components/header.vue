<script>
export default {
    name: 'Header',
    methods: {
        doLogout() {
            this.$store.dispatch('logout')
                .then(() => {
                    this.$router.push('/login')
                })
        }
    }
}
</script>

<template>
    <b-navbar type="light" variant="warning">
        <b-container>
            <b-navbar-brand>Browser Dialer</b-navbar-brand>

            <b-collapse is-nav>
                <!-- right content -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item to="users">
                        Users
                    </b-nav-item>
                    <b-nav-item to="calls">
                        Calls
                    </b-nav-item>
                    <b-nav-item-dropdown text="User" right>
                        <b-dropdown-item href="#" @click="doLogout">Sign out</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-container>
    </b-navbar>
</template>