<script>
import { Device } from "twilio-client";
import axios from "../../axios";
import firebase from "firebase/app";
import { mapGetters } from "vuex";
import { handleError, handleMessage } from "../../handleErrors";
import IncomingCallModal from "../../components/IncomingCallModal";
import IncomingCallCard from "../../components/IncomingCallCard";
import { initWorker } from "../../twilio";
import CallStatus from '../../components/CallStatus';
import TransferOption from '../../components/TransferOption';

export default {
  components: { IncomingCallModal, IncomingCallCard, CallStatus, TransferOption },
  name: "Calls",
  data: () => ({
    calls: [],
    selectUser: null,
    onPhone: false,
    muted: false,
    log: "Connecting...",
    queueCalls: [],
    selectTransfer: null,
    usersToCall: [],
    usersData: [],
    InConn: null,
    OutConn: null,
    showInCallModal: false,
    worker: null,
    reservation: null,
    available: false,
    activity: 'Offline',
    openTransfer: false,
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
    hangUpAndCompleteTask() {
      Device.disconnectAll();
      if (this.reservation) {
        this.reservation.task.complete();
        // this.completeTask(this.reservation.task.sid);
      }
      this.onPhone = false;
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
        console.log("Incoming connection from ", conn);

        if (conn.direction === "INCOMING") {
          this.InConn = conn;
          this.onPhone = true;
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

      worker.on('reservation.wrapup', () => {
        this.reservation = null;
      })
    },
    async getCallsHistory() {
      try {
        const result = await axios.get('/calls');

        if(result.data) {
          this.calls = result.data
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    async putOnHold() {
      try {
        const { conference } = this.reservation.task.attributes

        if(conference) {
          const result = await axios.post(`taskRouter/putOnHold/${conference.sid}/${conference.participants.customer}`)

          console.log(result.data);
        }
      } catch (error) {
        handleError(error, this, "danger");
      }
    },
    async transfer(data) {
      try {
        const { conference } = this.reservation.task.attributes;
        const taskSid = this.reservation.task.sid;

        const result = await axios.post('taskRouter/transfer', {
          conferenceSid: conference.sid,
          participantSid: conference.participants.customer,
          taskSid,
          department: data.department,
          agentId: data.agentId
        })

        this.hangUpAndCompleteTask();
        this.openTransfer = false;
        handleMessage('Transfer complete!', this, 'success');

        console.log('transfer new task: ', result.data);
      } catch (error) {
        handleError(error, this, "danger");
      }
    }
  },
  created() {
    this.getToken();
    this.listenIncomingCalls();
    // this.getCallsHistory();
  },
  async mounted() {
    await this.getUsers();
    this.getQueueCalls();
  }
};
</script>

<template>
  <b-container fluid>
    <div class="d-flex">
      <b-card style="width: 100%" title="Calls">
        <call-status :activity="activity" :available="available" />
        <div id="outbound-calls" class="d-flex mb-3">
          <div class="mr-4">
            <b-form-select
              style="width: 360px"
              v-model="selectUser"
              :options="usersToCall"
              :disabled="onPhone"
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
          <div style="display: inline-block">
            <b-button class="mx-2" :disabled="!reservation ? true : false" @click="openTransfer = true">Transfer</b-button>
          </div>
        </div>
        <hr />
        <incoming-call-card :call-attributes="reservation ? reservation.task.attributes : {}" />
        <b-table-simple>
          <b-thead>
            <b-tr>
              <b-th>Contact</b-th>
              <b-th>Direction</b-th>
              <b-th>Date</b-th>
              <b-th>Time</b-th>
              <b-th></b-th>
            </b-tr>
          </b-thead>
          <!-- <b-tbody>
            <b-tr>
              <b-td></b-td>
              <b-td></b-td>
              <b-td></b-td>
              <b-td></b-td>
              <b-td></b-td>
            </b-tr>
          </b-tbody> -->
          <b-tbody>
            <b-tr>
              <b-td colspan="5" class="text-center">No Data</b-td>
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
    <transfer-option @onTransfer="transfer" @onClose="openTransfer = false" :show="openTransfer" />
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