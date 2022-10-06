/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Paths, Runtime, Arc, Decorator, Chef, logFactory, utils} from '../../core.js';
import {MessageBus} from './MessageBus.js';
import {RecipeService} from '../RecipeService.js';
import {StoreService} from '../StoreService.js';
import {ComposerService} from '../ComposerService.js';
import {JSONataService} from '../../JSONata/JSONataService.js';

// n.b. lives in Worker context

// aliases
const {values} = Object;

// log
const log = logFactory(logFactory.flags.worker, 'worker', 'darkgreen');
log('worker is up');

// bus
export const WorkerBus = new MessageBus(globalThis);

// runtime represents a persona on this machine
const user = new Runtime('user');
// for use in console (might need to choose `arcsjs` thread)
globalThis.user = user;

// proxy persistance messages
user.persistor = {
  async restore(storeId, store) {
    log('restore', storeId);
    return serviceRequest({type: 'restore', storeId});
  },
  async persist(storeId, store) {
    log('persist', storeId);
    serviceRequest({type: 'persist', storeId, data: store.data});
  }
};

// composer proxy: sends render messages up
const composer = {
  render(packet) {
    try {
      WorkerBus.sendVibration({type: 'render', packet});
    } catch(x) {
      log.error(x);
      log.error(packet);
    }
  }
};

// map of service-ids to resolve-functions waiting for return values
const serviceCalls = {};

// Arc service calls come here first
const serviceHandler = async (arc, host, request) => {
  if (Array.isArray(request)) {
    return Promise.all(request.map(r => handleRequest(arc, host, r)));
  } else {
    return handleRequest(arc, host, request);
  }
};

const handleRequest = async(arc, host, request) => {
  if (request?.msg === 'request-context') {
    return ({runtime: user});
  }
  if (request.kind === 'RecipeService') {
    const value = await RecipeService(user, host, request);
    log('RecipeService', request, value);
    return value;
  }
  if (request.kind === 'StoreService') {
    const value = await StoreService(user, host, request);
    log('StoreService', request, value);
    return value;
  }
  if (request?.kind === 'ComposerService') {
    // TODO(sjmiles): this is a fundamentally new behavior
    // (ability to re-target the Render output of a Host)
    // so this is work-in-progress
    return ComposerService[request?.msg]?.(arc, host, request);
  }
  if (request?.kind === 'JSONataService') {
    return JSONataService[request?.msg]?.(arc, host, request);
  }
  return serviceRequest(request);
};

// ... then here
const serviceRequest = async request => {
  // if not handled, make a service-id
  const sid = utils.makeId(4, 4);
  // post a request with the service-id
  WorkerBus.sendVibration({type: 'service', sid, request});
  // create a promise which may be resolved by invoking `serviceCalls[sid]`
  return new Promise(resolve => serviceCalls[sid] = resolve);
};

// ... and then finally resolved here (or dangle forever)
const resolveRequest = async (sid, data) => {
  serviceCalls[sid]?.(data);
  delete serviceCalls[sid];
};

const getArc = arc => user.arcs[arc];
const requireArc = async arc => getArc(arc) ?? await handlers.createArc({arc});

const watching = {};
const storeChanged = (arc, storeKey) => {
  if (watching[storeKey]) {
    const realArc = getArc(arc);
    const store = realArc?.stores[storeKey];
    try {
      WorkerBus.sendVibration({type: 'store', arc, storeKey, data: store?.data});
    } catch(x) {
      log.error('error posting:', store?.data, x);
    }
  }
};

// the vibrations this worker can handle
const handlers = {
  rerender() {
    values(user.arcs).forEach(arc => arc.rerender());
  },
  handleEvent: async ({pid, eventlet}) => {
    // TODO(sjmiles): the composer doesn't know from Arcs, so the PID is all we have
    // perhaps we can imbue the PID with the ArcID also
    const arc = values(user.arcs).find(({hosts}) => hosts[pid]);
    arc?.onevent(pid, eventlet);
  },
  addPaths: ({paths}) => {
    Paths.add(paths);
  },
  setInjections: ({injections}) => {
    const o = Runtime.particleOptions || 0;
    const i = o.injections || 0;
    Runtime.particleOptions = {
      ...o,
      injections: {
        ...i,
        fetch,
        ...injections
      }
    };
  },
  secureWorker() {
    Runtime.securityLockdown?.(Runtime.particleOptions);
  },
  createArc: async ({arc}) => {
    const realArc = new Arc(arc);
    // observe store changes
    realArc.listen('store-changed', storeChanged.bind(null, arc));
    // send render packets to composer
    realArc.composer = composer;
    // async service interface for Particles
    realArc.service = async (host, request) => serviceHandler(realArc, host, request);
    // connect arc to runtime
    return user.addArc(realArc);
  },
  createParticle: async ({name, arc, meta, code}) => {
    const realArc = getArc(arc);
    if (realArc) {
      Runtime.particleOptions = {...(Runtime.particleOptions || 0), code};
      try {
        return await user.installParticle(realArc, meta, name);
      } finally {
        Runtime.particleOptions.code = null;
      }
    }
  },
  destroyParticle: async ({name, arc}) => {
    const host = getArc(arc)?.hosts[name];
    if (host) {
      host.detach();
      delete getArc(arc)?.hosts[name];
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
    const realArc = await requireArc(arc);
    return Chef.executeAll(recipes, user, realArc);
  },
  setStoreData: async ({arc, storeKey, data}) => {
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
      log(`setStoreData: set data into "${arc}:${storeKey}"`, data);
    }
  },
  getStoreData: ({arc, storeKey}) => {
    const realArc = getArc(arc);
    const store = realArc?.stores[storeKey];
    WorkerBus.sendVibration({type: 'store', arc, storeKey, data: store?.data});
  },
  watch: ({arc, storeKey, remove}) => {
    watching[storeKey] = (remove !== true);
  },
  setOpaqueData: async ({key, data}) => {
    Decorator.setOpaqueData(key, data);
  },
  serviceResult: ({sid, data}) => {
    resolveRequest(sid, data);
  }
};

const handleVibration = async msg => {
  const h = handlers[msg?.kind];
  if (h) {
    //log.group(msg?.kind, '...handler...');
    try {
      await h(msg);
    } catch(x) {
      log.error(x);
    }
    //log.groupEnd();
  }
};

const queue = [];

// respond to bus vibrations
WorkerBus.receiveVibrations(msg => {
  if (msg?.kind === 'serviceResult') {
    log('handle serviceResult', msg.data);
    // bypass queue
    handleVibration(msg);
  } else {
    queue.push(msg);
    log('add task', msg?.kind, '-', queue.length, 'task(s) in queue');
    flushQueue();
  }
});

// bus vibrations are handled in serial
const flushQueue = async () => {
  if (!flushQueue.busy) {
    flushQueue.busy = true;
    log.group('flush', queue.length);
    try {
      while (queue.length) {
        const msg = queue.shift();
        await handleVibration(msg);
      }
    } finally {
      log.groupEnd();
      flushQueue.busy = false;
    }
  } else {
    //log(queue.length, 'task(s) in queue');
  }
};
