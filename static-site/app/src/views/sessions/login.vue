<script>
import firebase from "firebase/app";

export default {
  name: "Login",
  data: () => ({
      signInImage: require('@/assets/images/photo-long-2.jpg')
  }),
  computed: {
      bgImage() {
          const max = 3, min = 1;
          const num = Math.floor(Math.random() * (max - min)) + min;

          return require(`@/assets/images/bg-${num}.jpg`)
      }
  },
  methods: {
      async doLogin() {
            const provider = new firebase.auth.GoogleAuthProvider();

            const user = await firebase.auth().signInWithPopup(provider)

            let idToken = await firebase.auth().currentUser.getIdToken(true)

            // make something with the token
            this.$store.dispatch('authenticate', idToken)
      }
  }
};
</script>

<template>
<div class="auth-layout-wrap" :style="{ backgroundImage: 'url(' + bgImage + ')' }">
    <div class="auth-content">
        <div id="login-box" class="card o-hidden">
            <div class="row">
                <div class="col-md-6">
                    <div class="p-4 signin-content">
                        <h1 class="mb-3 text-18">Sign In</h1>
                        <div class="mt-2">
                            <hr>
                            <div class="text-muted text-center mb-3 mt-5">
                                <small>Sign in with</small>
                            </div>
                            <div class="btn-wrapper text-center">
                                <b-button variant="outline-primary" @click="doLogin">
                                    <b-img src="@/assets/images/icons/common/google.svg" variant="link"></b-img>
                                    Google
                                </b-button>
                            </div>
                        </div>
                    </div>
                </div>
                <b-col
                    md="6"
                    class="text-center"
                    :style="{
                        backgroundImage: 'url(' + signInImage + ')',
                        backgroundPosition: 'center bottom',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundOrigin: 'content-box'
                    }"
                >
                </b-col>
            </div>
        </div>
    </div>
</div>
</template>

<style>
#bg-content {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

#login-box {
    border-radius: 10px;
    border: 0;
}

.signin-content {
    margin-bottom: 70px;
}
</style>