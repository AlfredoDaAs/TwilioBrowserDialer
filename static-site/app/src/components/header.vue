<script>
import firebase from "firebase/app";
import { mapGetters } from "vuex";

export default {
  name: "Header",
  computed: mapGetters(["getName", "isAdmin"]),
  methods: {
    async doLogout() {
      await firebase.auth().signOut();
      await this.$store.dispatch("logout");
      this.$router.push("/login");
    },
  }
};
</script>

<template>
  <b-navbar type="light" variant="warning">
    <b-container>
      <b-navbar-brand>Browser Dialer</b-navbar-brand>

      <b-collapse is-nav>
        <!-- right content -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item to="users" v-if="isAdmin"> Users </b-nav-item>
          <b-nav-item to="departments" v-if="isAdmin"> Deparments </b-nav-item>
          <b-nav-item to="contacts"> Contacts </b-nav-item>
          <b-nav-item to="numbers"> Phone Numbers </b-nav-item>
          <b-nav-item to="calls"> Calls </b-nav-item>
          <b-nav-item-dropdown :text="getName" right>
            <b-dropdown-item href="#" @click="doLogout"
              >Sign out</b-dropdown-item
            >
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-container>
  </b-navbar>
</template>