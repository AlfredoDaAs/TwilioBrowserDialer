<script>
import { Device } from 'twilio-client';
import axios from "../../axios";
import firebase from "firebase/app";
import { mapGetters } from 'vuex';

export default {
    name: 'Calls',
    data: () => ({
        countryCode: '52',
        currentNumber: '',
        onPhone: false,
        muted: false,
        connection: null,
        log: 'Connecting...',
        queueCalls: [],
        selectTransfer: null,
        users: []
    }),
    computed: mapGetters(['getUserId']),
    methods: {
        async getToken() {
            const result = await axios.get("/token");

            if (result.data) {
                const token = result.data.token;
                this.$store.dispatch("setToken", token);
            }
        },
        async toggleCall() {
            if (!this.onPhone) {
                await this.getToken()
                this.muted = false;
                this.onPhone = true;
                // make outbound call with current number
                var n = '+' + this.countryCode + this.currentNumber.replace(/\D/g, '');
                this.connection = Device.connect({ number: n });
                this.log = 'Calling ' + n;
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
            firebase.database().ref(`users/${this.getUserId}`).on('value', (user) => {
                if(!user.val()) {
                    return;
                }

                const data = user.val()
                console.log('data', data);
                this.queueCalls = data.calls
            })
        },
        listenUsers() {
            firebase.database().ref('users').on('value', (items) => {
                let usersList = []
                items.forEach(item => {
                    const key = item.key
                    const data = item.val()
                    if(key === this.getUserId && data.status === 'online') {
                        usersList.push({
                            value: key,
                            text: data.name
                        })
                    }
                })

                usersList.unshift({ value: null, text: 'User to Transfer' })
                this.users = usersList;
            })
        },
        transferTo() {
            if(this.selectTransfer && this.currentNumber) {
                const userRef = firebase.database().ref(`users/${this.selectTransfer}`)
                userRef.child('calls').update({
                    [this.currentNumber]: true
                })
                this.selectTransfer = null
            }
        },
        deleteFromQueue(number) {
            const userRef = firebase.database().ref(`users/${this.getUserId}`)
            userRef.child('calls').child(number).remove()
        },
        takeCall(number) {
            this.currentNumber = number
        }
    },
    created() {
        this.getQueueCalls();
        this.listenUsers();
    }
}
</script>

<template>
    <b-container>
        <b-row>
            <b-col md="6">
                <b-card title="Make a Call">
                    <div class="d-flex">
                        <div style="width: 75%">
                            <b-form-input max="10" v-model="currentNumber" type="number" placeholder="Enter your phone"></b-form-input>
                        </div>
                        <div>
                            <b-button class="mx-2" variant="success" @click="toggleCall" v-if="!onPhone">
                                <b-icon-telephone></b-icon-telephone>
                            </b-button>
                            <b-button class="mx-2" variant="danger" @click="toggleCall" v-else>
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
                            <b-form-select
                                v-model="selectTransfer"
                                :options="users"
                                placeholder=""
                            >
                            </b-form-select>
                        </div>
                        <div class="ml-2">
                            <b-button @click="transferTo">Transfer</b-button>
                        </div>
                    </div>
                    <b-alert class="mt-5" show variant="info">{{ onPhone ? log : 'Call status' }}</b-alert>
                </b-card>
            </b-col>
            <b-col md="6">
                <b-card title="Call queue">
                    <b-list-group>
                        <b-list-group-item v-for="(call, number, i) in queueCalls" :key="`${i}-${number}`">
                            <div class="d-flex justify-content-between">
                                <span>{{number}}</span>
                                <div>
                                    <b-button variant="success" size="sm" @click="takeCall(number)">take call</b-button>
                                    <b-button variant="danger" class="ml-2" size="sm" @click="deleteFromQueue(number)">Remove</b-button>
                                </div>
                            </div>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>