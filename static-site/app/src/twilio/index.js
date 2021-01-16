import { Device } from 'twilio-client';

export const initDevice = (token) => {
  Device.setup(token, {
    debug: false,
    enableRingingState: true
  })

  Device.on('ready', () => {
    console.log('Connected');
  })
}

export const destroyDevice = () => {
  Device.destroy();
}


export function initWorker(token) {
  try {
    return new Twilio.TaskRouter.Worker(token, false);
  } catch (error) {
    console.error(error);
  }
}