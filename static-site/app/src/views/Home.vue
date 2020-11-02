<script>
// @ is an alias to /src
import { Device } from 'twilio-client'

export default {
    name: 'Home',
    data: () => ({
        countryCode: '52',
        currentNumber: '3323436466',
        onPhone: false,
        muted: false,
        connection: null,
        log: 'Connecting...',
    }),
    methods: {
        toggleCall() {
            if (!this.onPhone) {
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
            <b-col>
                <h3>Make a Call</h3>
            </b-col>
        </b-row>
        <b-row class="mt-4">
            <b-col md="8">
                <b-form-input max="10" v-model="currentNumber" type="tel" placeholder="Enter your phone"></b-form-input>
            </b-col>
            <b-col md="2">
                <b-button @click="toggleCall">{{ onPhone ? 'Close Call' : 'Call' }}</b-button>
            </b-col>
            <b-col>
                <b-button @click="toggleMute">
                    <b-icon-mic v-if="!muted"></b-icon-mic>
                    <b-icon-mic-mute v-else></b-icon-mic-mute>
                </b-button>
            </b-col>
        </b-row>
        <b-alert class="mt-5" show variant="info">{{ onPhone ? log : 'Make a Call!' }}</b-alert>
    </b-container>
</template>
