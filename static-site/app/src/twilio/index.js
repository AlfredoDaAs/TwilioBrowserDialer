const { Device } = require('twilio-client');

export const initDevice = (token) => {
    Device.setup(token)

    Device.ready(() => {
        console.log('Connected');
    })
}