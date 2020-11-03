<script>
// @ is an alias to /src
import Header from "@/components/header";
import activeUsers from '@/components/activeUsers';

export default {
    name: 'Home',
    components: {
        Header,
        activeUsers
    },
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