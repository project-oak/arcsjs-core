
import {Paths, Runtime, Arc, Chef, logFactory} from '../../support.js';
import {MessageBus} from './MessageBus.js';

// log
const log = logFactory(true, 'ArcsJs', 'darkgreen');
log('worker is up');

// runtime represents a persona on this machine
const user = new Runtime('user');

// composer proxy: sends render messages up, and event messages down
const composer = {
  render(packet) {
    postMessage({type: 'render', packet});
  },
  onevent(pid, eventlet) {
  }
};

// service handler for user's arcs
const serviceHandler = (arc, host, request) => {
  switch (request?.msg) {
    case 'request-context':
      return ({runtime: user});
  }
};

// sets up composer and service handler
const configureArc = arc => {
  arc.service = (host, request) => serviceHandler(arc, host, request);
  arc.composer = composer;
  composer.onevent = arc.onevent.bind(arc);
};

const getArc = arc => user.arcs[arc];
const requireArc = async arc => getArc(arc) ?? await handlers.createArc({arc});

// commands this worker will honor
const handlers = {
  handleEvent: async ({pid, eventlet}) => {
    composer.onevent(pid, eventlet);
  },
  addPaths: ({paths}) => {
    Paths.add(paths);
  },
  createArc: async ({arc}) => {
    const realArc = new Arc(arc);
    // attach composer and service buses
    configureArc(realArc);
    return user.addArc(realArc);
  },
  createParticle: async ({name, arc, meta}) => {
    const realArc = getArc(arc);
    if (realArc) {
      return user.installParticle(realArc, meta, name);
    }
  },
  setInputs: async ({arc, particle, inputs}) => {
    const realArc = getArc(arc);
    if (realArc) {
      const host = realArc.hosts[particle];
      if (host) {
        host.inputs = inputs;
      }
    }
  },
  addRecipe: async ({arc, recipe}) => {
    return Chef.execute(recipe, user, await requireArc(arc));
  },
  addAssembly: async ({arc, recipes}) => {
    return Chef.executeAll(recipes, user, await requireArc(arc));
  },
  setStoreData: async({arc, storeKey, data}) => {
    const realArc = getArc(arc);
    if (!realArc) {
      log(`setStoreData: "${arc}" is not an Arc.`);
    }
    const store = realArc?.stores[storeKey];
    if (!store) {
      log(`setStoreData: "${storeKey}" is not a store.`);
    }
    if (store) {
      store.data = data;
      log(`setStoreData: set data into "${arc}:${storeKey}"`);

    }
  },
  getStoreData: async({arc, storeKey}) => {
    const realArc = getArc(arc);
    const store = realArc.stores[storeKey];
    if (store) {
      postMessage({type: 'store', arc, storeKey, data: store.data});
    }
  }
};

// bus
export const WorkerBus = new MessageBus(globalThis);

const queue = [];

// respond to bus vibrations
WorkerBus.receiveVibrations(msg => {
  queue.push(msg);
  flushQueue();
});

// bus vibrations are handled in serial
const flushQueue = async () => {
  if (!flushQueue.busy) {
    flushQueue.busy = true;
    try {
      while (queue.length) {
        const msg = queue.shift();
        const h = handlers[msg?.kind];
        if (h) {
          await h(msg);
        }
      }
    } finally {
      flushQueue.busy = false;
    }
  } else {
    log(queue.length, 'in queue');
  }
};
