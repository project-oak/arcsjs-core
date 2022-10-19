/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Arc} from './core/Arc.js';
import {Host} from './core/Host.js';
import {Store} from './core/Store.js';
import {EventEmitter} from './core/EventEmitter.js';
import {logFactory} from './utils/log.js';
import {makeId} from './utils/id.js';
import {ArcMeta, ParticleMeta, StoreMeta} from './core/types.js';
import {Dictionary, Logger} from './utils/types.js';

const log = logFactory(logFactory.flags.runtime, 'runtime', '#873600');

type UID = string;
export type ParticleFactory = (kind: string) => Promise<unknown>;

const particleFactoryCache = {};
const storeFactories = {};

const {keys} = Object;

export class Runtime extends EventEmitter {
  log: Logger;
  uid: UID; // user id
  nid: UID; // network id
  arcs: Dictionary<Arc>;
  stores: Dictionary<Store>;
  peers: Set<string>;
  shares: Set<string>;
  endpoint;
  network;
  surfaces;
  persistor;
  prettyUid;
  static securityLockdown;
  static particleIndustry;
  static particleOptions;
  constructor(uid) {
    uid = uid || 'user';
    super();
    this.arcs = {};
    this.surfaces = {};
    this.stores = {};
    this.peers = new Set();
    this.shares = new Set();
    this.setUid(uid);
    this.log = logFactory(logFactory.flags.runtime, `runtime:[${this.prettyUid}]`, '#873600');
    //Runtime.securityLockdown?.(Runtime.particleOptions);
  }
  setUid(uid: UID) {
    this.uid = uid;
    this.nid = `${uid}:${makeId(1, 2)}`;
    this.prettyUid = uid.substring(0, uid.indexOf('@') + 1) || uid;
  }
  async bootstrapArc(name: string, meta: ArcMeta, surface, service) {
    // make an arc on `surface`
    const arc = new Arc(name, meta, surface);
    // install service handler
    arc.hostService = this.serviceFactory(service);
    // add `arc` to runtime
    await this.addArc(arc);
    // fin
    return arc;
  }
  serviceFactory(service) {
    return async (host, request) => service.handle(this, host, request);
  }
  // TODO(sjmiles): duplication vis a vis `installParticle`
  // used by? ... [ParticleCook.js]
  async bootstrapParticle(arc, id, meta: ParticleMeta) {
    // make a host
    const host = new Host(id);
    // make a particle
    await this.marshalParticle(host, meta);
    // add `host` to `arc`
    await arc.addHost(host);
    // report
    log('bootstrapped particle', id);
    //log(host);
    return host;
  }
  // no-op surface mapping
  addSurface(id, surface) {
    this.surfaces[id] = surface;
  }
  getSurface(id) {
    return this.surfaces[id];
  }
  // map arcs by arc.id
  addArc(arc) {
    const {id} = arc;
    if (id && !this.arcs[id]) {
      return this.arcs[id] = arc;
    }
    throw `arc has no id, or id "${id}" is already in use`;
  }
  removeArc(arc) {
    const {id} = arc;
    if (!id || !this.arcs[id]) {
      throw !id ? `arc has no id` : `id "${id}" is not in use`;
    }
    delete this.arcs[id];
  }
  // create a particle inside of host
  async marshalParticle(host, particleMeta: ParticleMeta) {
    const particle = await this.createParticle(host, particleMeta.kind);
    return host.installParticle(particle, particleMeta);
  }
  // create a host, install a particle, add host to arc
  // TODO(sjmiles): duplication vis a vis `bootstrapParticle`
  // used by? ... [ArcsWorker.js]
  async installParticle(arc, particleMeta: ParticleMeta, name?) {
    this.log('installParticle', name, particleMeta, arc.id);
    // provide a default name
    name = name || makeId();
    // deduplicate name
    if (arc.hosts[name]) {
      let n = 1;
      for (; (arc.hosts[`${name}-${n}`]); n++);
      name = `${name}-${n}`;
    }
    // build the structure
    const host = new Host(name);
    await this.marshalParticle(host, particleMeta);
    await arc.addHost(host);
    return host;
  }
  // TODO(sjmiles): third version to rule them all; bring your own host
  async addParticle(arc, host: Host, particleMeta: ParticleMeta, name?) {
    this.log('addParticle', arc.id, name, particleMeta, arc.id);
    await this.marshalParticle(host, particleMeta);
    await arc.addHost(host);
    return host;
    // this.log('addParticle', name, particleMeta, arc.id);
    // // provide a default name
    // name = name || makeId();
    // // deduplicate name
    // if (arc.hosts[name]) {
    //   let n = 1;
    //   for (; (arc.hosts[`${name}-${n}`]); n++);
    //   name = `${name}-${n}`;
    // }
    // // build the structure
    // const host = new Host(name);
    // await this.marshalParticle(host, particleMeta);
    // await arc.addHost(host);
    // return host;
  }
  idFromName(name, list) {
    // provide a default name
    let id = name || makeId();
    // deduplicate name
    if (list[id]) {
      let n = 1;
      for (; (list[`${id}-${n}`]); n++);
      id = `${id}-${n}`;
    }
    // return unique id
    return id;
  }
  // map a store by a Runtime-specific storeId
  // Stores have no intrinsic id
  addStore(storeId, store) {
    // if the store needs to discuss things with Runtime
    // TODO(sjmiles): this is likely unsafe for re-entry
    if (store.marshal) {
      store.marshal(this);
    }
    // bind to persist/restore functions
    store.persist = async () => this.persistStore(storeId, store);
    store.restore = async () => this.restoreStore(storeId, store);
    // override the Store's own persistor to use the runtime persistor
    // TODO(sjmiles): why?
    // if (store.persistor) {
    //   store.persistor.persist = store => this.persistor?.persist(storeId, store);
    // }
    // bind this.storeChanged to store.change (and name the binding)
    const name = `${this.nid}:${storeId}-changed`;
    const onChange = this.storeChanged.bind(this, storeId);
    store.listen('change', onChange, name);
    // map the store
    this.stores[storeId] = store;
    // evaluate for sharing
    this.maybeShareStore(storeId);
    // notify listeners that a thing happened
    // TODO(sjmiles): makes no sense without id
    //this.fire('store-added', store);
  }
  protected async persistStore(storeId, store) {
    if (store.shouldPersist()) {
      this.log(`persistStore "${storeId}"`);
      return this.persistor.persist?.(storeId, store);
    }
  }
  protected async restoreStore(storeId, store) {
    if (store.shouldPersist()) {
      this.log(`restoreStore "${storeId}"`);
      return this.persistor.restore?.(storeId);
    }
  }
  protected storeChanged(storeId, store) {
    this.log('storeChanged', storeId);
    this.network?.invalidatePeers(storeId);
    this.onStoreChange(storeId, store);
    this.fire('store-changed', {storeId, store});
  }
  // TODO(sjmiles): evacipate this method
  protected onStoreChange(storeId, store) {
    // override for bespoke response
  }
  protected do(storeId, task) {
    task(this.stores[storeId]);
  }
  removeStore(storeId) {
    this.do(storeId, store => {
      store?.unlisten('change', `${this.nid}:${storeId}-changed`);
    });
    delete this.stores[storeId];
  }
  maybeShareStore(storeId) {
    this.do(storeId, store => {
      if (store?.is('shared')) {
        this.shareStore(storeId);
      }
    });
  }
  addPeer(peerId) {
    this.peers.add(peerId);
    [...this.shares].forEach(storeId => this.maybeShareStoreWithPeer(storeId, peerId));
  }
  shareStore(storeId) {
    this.shares.add(storeId);
    [...this.peers].forEach(peerId => this.maybeShareStoreWithPeer(storeId, peerId));
  }
  protected maybeShareStoreWithPeer(storeId, peerId) {
    this.do(storeId, store => {
      const nid = this.uid.replace(/\./g, '_');
      if (!store.is('private') || (peerId.startsWith(nid))) {
        this.shareStoreWithPeer(storeId, peerId);
      }
    });
  }
  protected shareStoreWithPeer(storeId, peerId) {
    this.network?.shareStore(storeId, peerId);
  }
  protected async createParticle(host, kind): Promise<unknown> {
    try {
      const factory = await this.marshalParticleFactory(kind);
      return factory?.(host);
    } catch(x) {
      log.error(`createParticle(${kind}):`, x);
    }
  }
  protected async marshalParticleFactory(kind: string): Promise<ParticleFactory> {
    return particleFactoryCache[kind] ?? this.lateBindParticle(kind);
  }
  protected lateBindParticle(kind: string, code?: string): Promise<unknown> {
    const {particleOptions, particleIndustry, registerFactoryPromise} = Runtime;
    if (!particleIndustry) {
      throw `no ParticleIndustry to create '${kind}'`;
    } else {
      const factoryPromise = particleIndustry(kind, {...particleOptions, code});
      registerFactoryPromise(kind, factoryPromise);
      return factoryPromise;
    }
  }
  protected static registerFactoryPromise(kind, factoryPromise: Promise<unknown>) {
    return particleFactoryCache[kind] = factoryPromise;
  }
  requireStore(meta: StoreMeta): Store|undefined {
    let store = this.stores[meta.name];
    if (!store) {
      store = this.createStore(meta);
      this.addStore(meta.name, store);
    }
    return store;
  }
  createStore(meta: StoreMeta) {
    const key = keys(storeFactories).find(tag => meta.tags?.includes?.(tag));
    const storeClass = storeFactories[String(key)] || Store;
    return new storeClass(meta);
  }
  static registerStoreClass(tag, storeClass) {
    storeFactories[tag] = storeClass;
  }
}
