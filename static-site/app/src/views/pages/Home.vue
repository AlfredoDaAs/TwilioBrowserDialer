<script>
// @ is an alias to /src
import Header from "@/components/header";
import activeUsers from '@/components/activeUsers';
import { initRtdbUserStatus } from '../../firebase';
import { mapGetters } from 'vuex';

export default {
    name: 'Home',
    components: {
        Header,
        activeUsers
    },
    computed: mapGetters(['getUserId']),
    created() {
        initRtdbUserStatus(this.getUserId)
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