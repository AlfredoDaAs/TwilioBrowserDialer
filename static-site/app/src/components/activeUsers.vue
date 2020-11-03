<script>
export default {
    name: 'ActiveUsers'
}
</script>

<template>
    <b-container>
        <b-card id="usersCardList" header="Online Users">
            <div id="activeUsersBox">
                <b-list-group>
                    <b-list-group-item class="d-flex align-items-center" v-for="n in 20" :key="n">
                        User #{{n}}
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