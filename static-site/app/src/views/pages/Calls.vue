<script>
import firebase from "firebase/app";
import { Device } from "twilio-client";
import { mapGetters } from "vuex";
import moment from 'moment'

import axios from "../../axios";
import { handleError, handleMessage } from "../../handleErrors";
import IncomingCallModal from "../../components/IncomingCallModal";
import IncomingCallCard from "../../components/IncomingCallCard";
import { initWorker } from "../../twilio";
import CallStatus from '../../components/CallStatus';
import TransferOption from '../../components/TransferOption';
import { isOnlineForDatabase, isOfflineForDatabase } from '../../firebase'

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

export default {
  components: { IncomingCallModal, IncomingCallCard, CallStatus, TransferOption },
  name: "Calls",
  data: () => ({
    callTo: null,
    callNumber: null,
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
  computed: mapGetters(["getUserId", "getPhoneNumber", "getFullName"]),
  filters: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD hh:mm:ss a')
    },
    formatCallDuration(duration) {
      if(!duration) return '00:00:00'

      const time = Number(duration)
      const hours = Math.floor(time / 3600)
      const minutes = Math.floor(time / 60)
      const seconds = time % 60;

      return str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
    }
  },
  methods: {
    async getUsers() {
      try {
        const usersData = await axios.get("/users");
        const contactsData = await axios.get('/contacts');

        if(usersData.data) {
          usersData.data.forEach((user) => {
            if(user.phoneNumber) {
              this.usersToCall.push({
                label: `Usr: ${user.name} ${user.lastName} (${user.phoneNumber})`,
                phoneNumber: user.phoneNumber
              })
            }
          })
        }

        if(contactsData.data) {
          contactsData.data.forEach((user) => {
            if(user.phoneNumber) {
              this.usersToCall.push({
                label: `Cont: ${user.firstName} ${user.lastName} (${user.phoneNumber})`,
                phoneNumber: user.phoneNumber
              })
            }
          })
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
      if (!this.onPhone && (this.callTo || this.callNumber)) {
        let phoneNumber = ''
        if(this.callNumber) {
          phoneNumber = `${this.callNumber.startsWith('+') ? '' : '+'}${this.callNumber.trim().replace(/[a-zA-Z_-]|\s|\.|,|&/g, '')}`
        } else {
          phoneNumber = this.callTo
        }

        this.muted = false;
        this.onPhone = true;
        // make outbound call with current number
        var n = "+" + phoneNumber.replace(/\D/g, "");
        this.getCallsHistory(n)
        this.OutConn = Device.connect({
          To: n,
          callerId: this.getPhoneNumber,
          agent: this.getUserId,
        });
        this.log = "Calling " + n;
      } else {
        this.hangUpAndCompleteTask();
      }
    },
    hangUpAndCompleteTask() {
      Device.disconnectAll();
      if (this.reservation) {
        this.reservation.task.complete();
        // this.completeTask(this.reservation.task.sid);
      }
      this.onPhone = false;
      this.calls = []
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
        this.calls = []
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
        const userState = ready.available ? isOnlineForDatabase : isOfflineForDatabase
        firebase.database().ref(`users/${this.getUserId}`).update({
            ...userState,
            name: this.getFullName,
        })
      });

      worker.on("reservation.accepted", (reservation) => {
        this.reservation = reservation;
        this.getCallsHistory(reservation.task.attributes.from);
        /* console.log(reservation.task.attributes); // {foo: 'bar', baz: 'bang' }
        console.log(reservation.task.priority); // 1
        console.log(reservation.task.age); // 300
        console.log(reservation.task.sid); // WTxxx
        console.log(reservation.sid); // WRxxx */
      });

      worker.on('activity.update', (worker) => {
        this.available = worker.available
        this.activity = worker.activityName
        const userState = worker.available ? isOnlineForDatabase : isOfflineForDatabase
        firebase.database().ref(`users/${this.getUserId}`).update({
            ...userState,
            name: this.getFullName,
        })
      })

      worker.on('reservation.wrapup', () => {
        this.reservation = null;
      })
    },
    async getCallsHistory(from) {
      try {
        const result = await axios.get(`/calls/from/${from}`);

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
    },
    onCallToInput(value) {
      if(value && this.callNumber !== null) {
        this.callNumber = null;
      }
    },
    onCallNumberInput(value) {
      if(value && this.callTo !== null) {
        this.callTo = null;
      }
    }
  },
  created() {
    this.getToken();
    this.listenIncomingCalls();
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
            <div class="d-flex align-items-center">
              <b-form-input class="mr-2" style="width: 200px" :disabled="onPhone" v-model="callNumber" placeholder="+123456789" @input="onCallNumberInput"></b-form-input>
              <span>Or</span>
              <div class="ml-2">
                <v-select style="min-width: 300px" :options="usersToCall" :disabled="onPhone" v-model="callTo" :reduce="usr => usr.phoneNumber" placeholder="Call to User/Contact" @input="onCallToInput" />
              </div>
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
          </div>
          <div style="display: inline-block">
            <b-button class="mx-2" :disabled="!reservation ? true : false" @click="openTransfer = true">Transfer</b-button>
          </div>
        </div>
        <hr />
        <incoming-call-card :call-attributes="reservation && reservation.task ? reservation.task.attributes : {}" />
        <b-table-simple sticky-header="800px">
          <b-thead>
            <b-tr>
              <b-th>From</b-th>
              <b-th>To</b-th>
              <b-th>Direction</b-th>
              <b-th>Date</b-th>
              <b-th>Duration</b-th>
              <b-th></b-th>
            </b-tr>
          </b-thead>
          <b-tbody v-if="calls.length > 0">
            <b-tr v-for="call in calls" :key="call.id">
              <b-td>{{ call.from }}</b-td>
              <b-td>{{ call.to }}</b-td>
              <b-td>{{ call.direction }}</b-td>
              <b-td>{{ call.createdAt | formatDate }} </b-td>
              <b-td>{{ call.callDuration | formatCallDuration }}</b-td>
              <b-td></b-td>
            </b-tr>
          </b-tbody>
          <b-tbody v-else>
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
    <!-- <b-row class="mt-2">
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
    </b-row> -->
  </b-container>
</template>