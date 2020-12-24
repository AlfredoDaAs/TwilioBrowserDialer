<script>
import { Device } from "twilio-client";
import axios from "../../axios";
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import { handleError } from "../../handleErrors";
import IncomingCallModal from "../../components/IncomingCallModal";
import IncomingCallCard from "../../components/IncomingCallCard";
import { initWorker } from "../../twilio";

export default {
  components: { IncomingCallModal, IncomingCallCard },
  name: "Calls",
  data: () => ({
    selectUser: null,
    onPhone: false,
    muted: false,
    log: "Connecting...",
    queueCalls: [],
    selectTransfer: null,
    transferUsers: [],
    usersToCall: [],
    usersData: [],
    InConn: null,
    OutConn: null,
    showInCallModal: false,
    worker: null,
    reservation: null,
    available: false,
    activity: 'Offline'
  }),
  computed: mapGetters(["getUserId", "getPhoneNumber"]),
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
    async getToken() {
      const result = await axios.get(`/token/${this.getUserId}`);

      if (result.data) {
        const token = result.data.token;
        this.$store.dispatch("setToken", token);
        this.initTaskRouter(result.data.trToken);
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
          this.OutConn = Device.connect({
            To: n,
            callerId: this.getPhoneNumber,
            agent: this.getUserId,
          });
          this.log = "Calling " + n;
        }
      } else {
        // hang up call in progress
        Device.disconnectAll();
        if (this.reservation) {
          this.reservation.task.complete();
          // this.completeTask(this.reservation.task.sid);
        }
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
        .on("child_changed", (user) => {
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

          usersList.unshift({ value: null, text: "Transfer To" });
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
    listenIncomingCalls() {
      Device.on("incoming", (conn) => {
        console.log(
          "Incoming connection from ",
          conn.customParameters.get("callId")
        );

        if (conn.direction === "INCOMING") {
          this.InConn = conn;
          this.showInCallModal = true;
        }
      });

      Device.on("disconnect", (conn) => {
        this.onPhone = false;
        this.InConn = null;
        this.OutConn = null;
      });
    },
    handleCancelCall() {
      this.InConn.reject();
      this.showInCallModal = false;
    },
    handleAcceptCall() {
      this.InConn.accept();
      this.showInCallModal = false;
    },
    initTaskRouter(token) {
      const worker = initWorker(token);
      this.worker = worker;

      worker.on("ready", (ready) => {
        console.log(`Worker ${ready.sid} is now ready for work`);
        this.available = ready.available
        this.activity = ready.activityName
        console.log(ready);
      });

      worker.update("ActivitySid", "WA3ebbf81a5d6a83b55472203d2c24bc08", function(err, worker) {
          console.log(worker.sid);
      });

      worker.on('reservation.created', (reservation) => {
        reservation.dequeue();
      });

      worker.on("reservation.accepted", (reservation) => {
        this.reservation = reservation;
        /* console.log(reservation.task.attributes); // {foo: 'bar', baz: 'bang' }
        console.log(reservation.task.priority); // 1
        console.log(reservation.task.age); // 300
        console.log(reservation.task.sid); // WTxxx
        console.log(reservation.sid); // WRxxx */
      });

      worker.on('activity.update', (worker) => {
        this.available = worker.available
        this.activity = worker.activityName
      })
    },
    completeTask(taskSid) {
      console.log("taskSid", taskSid, this.worker);
      this.worker.completeTask(taskSid, function (error, completedTask) {
        if (error) {
          console.log(error.code);
          console.log(error.message);
          return;
        }
        console.log("Completed Task: " + completedTask.assignmentStatus);
      });
    },
    activityChange(val) {
    }
  },
  created() {
    this.getToken();
    this.listenUsers();
    this.listenIncomingCalls();
  },
  async mounted() {
    await this.getUsers();
    this.getQueueCalls();
  },
};
</script>

<template>
  <b-container fluid>
    <div class="d-flex">
      <b-card style="width: 100%" title="Calls">
        <div class="d-flex mb-2">
          <h5>Receive calls status: </h5>
          <b-form-checkbox class="ml-2" disabled @change="activityChange" v-model="available" name="check-button" switch>
            Available ({{ activity }})
          </b-form-checkbox>
        </div>
        <div id="outbound-calls" class="d-flex mb-3">
          <div class="mr-4">
            <b-form-select
              style="width: 360px"
              v-model="selectUser"
              :options="usersToCall"
            ></b-form-select>
            <div style="display: inline-block">
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
          <div>
            <b-form-select
              style="width: 360px"
              v-model="selectTransfer"
              :options="transferUsers"
            ></b-form-select>
            <div style="display: inline-block">
              <b-button class="mx-2" @click="transferTo">Transfer</b-button>
            </div>
          </div>
        </div>
        <hr />
        <incoming-call-card
          :callId="InConn ? InConn.customParameters.get('callId') : ''"
        />
        <b-table-simple>
          <b-thead>
            <b-tr>
              <b-th>From</b-th>
              <b-th>To</b-th>
              <b-th>Direction</b-th>
              <b-th>Date</b-th>
              <b-th>Time</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr>
              <b-td></b-td>
              <b-td></b-td>
              <b-td></b-td>
              <b-td></b-td>
              <b-td></b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-card>
    </div>
    <incoming-call-modal
      :from="InConn ? InConn.parameters.From : ''"
      :show="showInCallModal"
      @onCancel="handleCancelCall"
      @onAccept="handleAcceptCall"
    />
    <b-row class="mt-2">
      <b-col md="5">
        <b-card title="Queue Calls">
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