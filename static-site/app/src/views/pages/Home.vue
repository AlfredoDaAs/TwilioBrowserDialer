<script>
// @ is an alias to /src
import Header from "@/components/header";
import activeUsers from '@/components/activeUsers';
import axios from "../../axios";

export default {
    name: 'Home',
    components: {
        Header,
        activeUsers
    },
    methods: {
        async getToken() {
            const result = await axios.get("/token");

            if (result.data) {
                const token = result.data.token;
                this.$store.dispatch("setToken", token);
            }
        },
    },
    created() {
        this.getToken();
    }
}
</script>

<template>
    <div>
        <Header />
        <div id="navContent">
            <div id="users-list">
                <active-users />
            </div>
            <div id="router-content" class="flex-grow-1">
                <router-view />
            </div>
        </div>
    </div>
</template>

<style>
#navContent {
    padding-top: 30px;
    display: grid;
    grid-template-columns: minmax(150px, 25%) 1fr;
}
</style>