<script>
import { Device } from "twilio-client";
import axios from "../../axios";
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import { handleError } from "../../handleErrors";

export default {
  name: "Calls",
  data: () => ({
    selectUser: null,
    onPhone: false,
    muted: false,
    connection: null,
    log: "Connecting...",
    queueCalls: [],
    selectTransfer: null,
    transferUsers: [],
    usersToCall: [],
    usersData: [],
  }),
  computed: mapGetters(["getUserId"]),
  methods: {
    async getUsers() {
      try {
        const result = await axios.get("/users");

        if (result.data) {
          const users = result.data;

          users.forEach((user) => {
            this.usersData[user.id] = user;
          });

          let userOptions = users.map((user) => ({
            value: user.id,
            text: `${user.name} ${user.lastName}`,
          }));

          userOptions.unshift({ value: null, text: "Call to..." });

          userOptions = userOptions.filter(
            (opt) => opt.value !== this.getUserId
          );
          this.usersToCall = userOptions;
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    async getUser(id) {
      try {
        if (id) {
          const result = await axios.get(`users/${id}`);

          return result.data;
        } else {
          return null;
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    async getToken() {
      const result = await axios.get("/token", { id: this.getUserId });

      if (result.data) {
        const token = result.data.token;
        this.$store.dispatch("setToken", token);
      }
    },
    toggleCall() {
      if (!this.onPhone && this.selectUser) {
        const user = this.usersData[this.selectUser];
        if (user) {
          this.muted = false;
          this.onPhone = true;
          // make outbound call with current number
          var n = "+" + user.phoneNumber.replace(/\D/g, "");
          this.connection = Device.connect({ number: n });
          this.log = "Calling " + n;
        }
      } else {
        // hang up call in progress
        Device.disconnectAll();
        this.onPhone = false;
      }
    },
    toggleMute() {
      this.muted = !this.muted;
      Device.activeConnection().mute(this.muted);
    },
    getQueueCalls() {
      firebase
        .database()
        .ref(`users/${this.getUserId}/calls`)
        .on('child_changed', (user) => {
          if (!user.val()) {
            return;
          }

          const data = user.val();
          let callsObjs = [];
          for (const key in data.calls) {
            const call = data.calls[key];
            const user = this.usersData[key];
            callsObjs.push({
              id: user.id,
              date: call.date,
              name: `${user.name} ${user.lastName}`,
            });
          }
          const sortedCalls = callsObjs.sort((a, b) => a.date - b.date);
          this.queueCalls = sortedCalls;
        });
    },
    listenUsers() {
      firebase
        .database()
        .ref("users")
        .on("value", (items) => {
          let usersList = [];
          items.forEach((item) => {
            const key = item.key;
            const data = item.val();
            if (key !== this.getUserId && data.status === "online") {
              usersList.push({
                value: key,
                text: data.name,
              });
            }
          });

          usersList.unshift({ value: null, text: "User to Transfer" });
          this.transferUsers = usersList;
        });
    },
    transferTo() {
      if (
        this.selectTransfer &&
        this.selectUser &&
        this.selectUser !== this.getUserId
      ) {
        const user = this.usersData[this.selectUser];
        const userRef = firebase.database().ref(`users/${this.selectTransfer}`);
        userRef.child("calls").update({
          [this.selectUser]: {
            date: firebase.database.ServerValue.TIMESTAMP,
            name: `${user.name} ${user.lastName}`,
          },
        });
        this.selectTransfer = null;
      }
    },
    deleteFromQueue(id) {
      const userRef = firebase.database().ref(`users/${this.getUserId}`);
      userRef.child("calls").child(id).remove();
    },
    takeCall(id) {
      this.selectUser = id;
    },
  },
  created() {
    this.getToken();
    this.listenUsers();
  },
  async mounted() {
    await this.getUsers();
    this.getQueueCalls();
  },
};
</script>

<template>
  <b-container>
    <b-row>
      <b-col md="6">
        <b-card title="Make a Call">
          <div class="d-flex">
            <div style="width: 75%">
              <b-form-select v-model="selectUser" :options="usersToCall">
              </b-form-select>
            </div>
            <div>
              <b-button
                class="mx-2"
                variant="success"
                @click="toggleCall"
                v-if="!onPhone"
              >
                <b-icon-telephone></b-icon-telephone>
              </b-button>
              <b-button
                class="mx-2"
                variant="danger"
                @click="toggleCall"
                v-else
              >
                <b-icon-telephone-x></b-icon-telephone-x>
              </b-button>
              <b-button @click="toggleMute">
                <b-icon-mic v-if="!muted"></b-icon-mic>
                <b-icon-mic-mute v-else></b-icon-mic-mute>
              </b-button>
            </div>
          </div>
          <div id="transfer-calls" class="d-flex mt-3">
            <div style="width: 75%">
              <b-form-select v-model="selectTransfer" :options="transferUsers">
              </b-form-select>
            </div>
            <div class="ml-2">
              <b-button @click="transferTo">Transfer</b-button>
            </div>
          </div>
          <b-alert class="mt-5" show variant="info">{{
            onPhone ? log : "Call status"
          }}</b-alert>
        </b-card>
      </b-col>
      <b-col md="6">
        <b-card title="Call queue">
          <b-list-group>
            <b-list-group-item
              v-for="(call, i) in queueCalls"
              :key="`${i}-${call.number}`"
            >
              <div class="d-flex justify-content-between">
                <span>{{ call.name }}</span>
                <div>
                  <b-button
                    variant="success"
                    size="sm"
                    @click="takeCall(call.id)"
                    >take call</b-button
                  >
                  <b-button
                    variant="danger"
                    class="ml-2"
                    size="sm"
                    @click="deleteFromQueue(call.id)"
                    >Remove</b-button
                  >
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>