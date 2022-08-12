import './arcs/config.js';
import {Runtime, Arc, Chef, logFactory} from '../arcsjs-core.js';
import {MessageBus} from './arcs/MessageBus.js';

// log
const log = logFactory(true, 'ArcsJs', 'darkgreen');
log('worker is up');

// runtime represents a persona on this machine
const user = new Runtime('user');

// commands this worker will honor
const handlers = {
  addRecipe: async ({arc, recipe}) => {
    const realArc = (user.arcs[arc]) ?? await handlers.createArc({arc});
    Chef.execute(recipe, user, realArc);
  },
  createArc: async ({arc}) => {
    return user.addArc(new Arc(arc));
  }
};

// bus
export const WorkerBus = new MessageBus(globalThis);
// respond to bus vibrations
WorkerBus.receiveVibrations(msg => {
  const h = handlers[msg?.kind];
  if (h) {
    h(msg);
  }
});
