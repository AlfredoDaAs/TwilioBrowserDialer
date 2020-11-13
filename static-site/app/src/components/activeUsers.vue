<script>
import firebase from "firebase/app";
import { mapGetters } from 'vuex';

export default {
    name: 'ActiveUsers',
    data: () => ({
        users: []
    }),
    computed: mapGetters(['getUserId']),
    methods: {
        listenUsers() {
            firebase.database().ref('users').on('value', (items) => {
                let usersList = []
                items.forEach(item => {
                    const key = item.key
                    const data = item.val()
                    if(key === this.getUserId && data.status === 'online') {
                        usersList.push({
                            key: key,
                            name: data.name,
                            status: data.status
                        })
                    }
                })

                this.users = usersList;
            })
        }
    },
    created() {
        this.listenUsers()
    }
}
</script>

<template>
    <b-container>
        <b-card id="usersCardList" header="Online Users">
            <div id="activeUsersBox">
                <b-list-group>
                    <b-list-group-item class="d-flex justify-content-between" v-for="user in users" :key="user.key">
                        <span>{{ user.name }}</span>
                        <div>
                            <b-badge variant="success">Connected</b-badge>
                        </div>
                    </b-list-group-item>
                </b-list-group>
            </div>
        </b-card>
    </b-container>
</template>

<style>
#usersCardList > .card-body {
    padding: 0;
}

#activeUsersBox {
    overflow: scroll;
    max-height: 600px;
}
</style>