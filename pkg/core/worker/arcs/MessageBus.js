import {logFactory} from '../../js/utils/log.js';

const log = logFactory(true, 'Bus', 'olive');

export const MessageBus = class {
  constructor(connection) {
    this.connection = connection;
    this.connection.addEventListener('error', e => log.error(e));
  }
  dispose() {
    this.eventListener.removeEventListener('message', this.listener);
  }
  sendVibration(msg) {
    log(`sending:`, msg);
    this.connection.postMessage(msg);
  }
  receiveVibrations(handler) {
    this.listener = msg => {
      const data = (msg.type === 'message') ? msg.data : msg;
      log(`receiving:`, data);
      handler?.(data);
    };
    this.connection.addEventListener('message', this.listener);
  }
};