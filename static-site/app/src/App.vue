<script>
import { initFirebaseApp } from "./firebase";
import { mapGetters } from "vuex";
import { refreshInstanceHeaders } from "./axios";

export default {
  name: "app",
  computed: mapGetters(['getToken']),
  watch: {
      getToken(newToken, oldToken) {
          if(newToken !== oldToken) {
              refreshInstanceHeaders(newToken)
          }
      }
  },
  created() {
    initFirebaseApp();
    refreshInstanceHeaders(this.getToken);
  },
};
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
