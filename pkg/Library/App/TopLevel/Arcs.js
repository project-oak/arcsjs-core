import {
  logFactory,
  Paths, Runtime, Arc,
  Chef
} from '../../Core/core.js';
//import {logFactory} from '../../Core/utils.js';

const log = logFactory(true, 'Arcs', 'orange', 'black');

export const Arcs = {
  async init({root, paths, onservice, injections}) {
    log({paths, injections});
    // set composer root
    //arcs.setComposerRoot(root);
    // connect app-supplied conduits
    this.onservice = onservice;
    // memoize paths
    this.addPaths(paths);
    // initialize particle scope
    this.setInjections(injections);
    // initiate security procedures
    this.secureWorker();
    // create runtime
    this.user = new Runtime('user');
    // for use in console (might need to choose `arcsjs` thread)
    Object.assign(globalThis, {Arcs});
  },
  addPaths(paths) {
    Paths.add(paths);
  },
  setInjections({injections}) {
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
  async addAssembly(arc, recipes) {
    const realArc = await this.requireArc(arc);
    return Chef.executeAll(recipes, this.user, realArc);
  },
  getArc(arc) {
    return this.user.arcs[arc];
  },
  async requireArc(arc) {
    return (this.getArc(arc)) ?? (this.createArc({arc}));
  },
  async createArc({arc}) {
    const realArc = new Arc(arc);
    // observe store changes
    //realArc.listen('store-changed', storeChanged.bind(null, arc));
    // send render packets to composer
    realArc.composer = this;
    // async service interface for Particles
    realArc.service = async (host, request) => this.serviceHandler(realArc, host, request);
    // connect arc to runtime
    return this.user.addArc(realArc);
  },
  render(packet) {
    try {
      //this.fire('render', packet);
      //WorkerBus.sendVibration({type: 'render', packet});
    } catch(x) {
      log.error(x);
      log.error(packet);
    }
  },
  serviceHandler() {
    //
  },
  rerender() {
    Object.values(this.user.arcs).forEach(arc => arc.rerender());
  }
};
