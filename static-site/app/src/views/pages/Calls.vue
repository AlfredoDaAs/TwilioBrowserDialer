<script>
import { Device } from 'twilio-client'
import axios from "../../axios";

export default {
    name: 'Calls',
    data: () => ({
        countryCode: '52',
        currentNumber: '',
        onPhone: false,
        muted: false,
        connection: null,
        log: 'Connecting...',
    }),
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
                    <b-alert class="mt-5" show variant="info">{{ onPhone ? log : 'Call status' }}</b-alert>
                </b-card>
            </b-col>
            <b-col md="6">
                <b-card title="Call queue">

                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>