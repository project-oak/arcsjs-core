import {MessageBus} from './MessageBus.js';

export const MainCan = class extends MessageBus {
  constructor(path, name) {
    const worker = new Worker(path, {type: 'module', name});
    worker.onerror = x => console.log('MainCan: worker error:', x);
    super(worker);
  }
};

// remember: worker path is document relative
export const ArcsWorker = new MainCan('./worker.js', 'arcsjs');