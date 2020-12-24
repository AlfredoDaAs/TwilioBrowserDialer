import { Device } from 'twilio-client';

export const initDevice = (token) => {
    Device.setup(token, {
      debug: true,
      enableRingingState: true
    })

  Device.on('ready', () => {
        console.log('Connected');
    })
}

export const destroyDevice = () => {
  Device.destroy();
}