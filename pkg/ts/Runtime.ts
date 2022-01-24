/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Arc} from './core/Arc.js';
import {Host} from './core/Host.js';
import {Store} from './core/Store.js';
import {EventEmitter} from './core/EventEmitter.js';
import {Paths} from './utils/paths.js';
import {EventEmitter} from './core/EventEmitter.js';
import {AggregateStore} from './core/AggregateStore.js';
import {AutomergeStore} from './crdt/AutomergeStore.js';
import {logFactory} from './utils/log.js';

const log = logFactory(logFactory.flags.runtime, 'runtime', 'forestgreen');

type Dictionary<T> = {[name: string]: T};
type ParticleFactory = (kind: string) => Promise<unknown>;

const particleFactoryCache = {};
const storeFactories = {};

const {keys} = Object;

export class Runtime extends EventEmitter {
  log;
  uid;
  arcs: Dictionary<Arc>;
  peers: Set<string>;
  shares: Set<string>;
  stores: Dictionary<Store>;
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
    this.uid = uid;
    this.arcs = {};
    this.surfaces = {};
    this.stores = {};
    this.peers = new Set();
    this.shares = new Set();
    this.prettyUid = uid.substring(0, uid.indexOf('@') + 1);
    this.log = logFactory(logFactory.flags.runtime, `runtime:[${this.prettyUid}]`, 'forestgreen');
    Runtime.securityLockdown?.(Runtime.particleOptions);
  }
  async bootstrapArc(name, meta, surface, service) {
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
    return async (host, request) => await service.handle(this, host, request);
  }
  async bootstrapParticle(arc, id, meta) {
    // make a host
    const host = new Host(id);
    // make a particle
    await this.marshalParticle(host, meta);
    // add `host` to `arc`
    const promise = arc.addHost(host);
    // report
    log(host);
    // we'll call you when it's ready
    return promise;
  }
  addSurface(id, surface) {
    this.surfaces[id] = surface;
  }
  getSurface(id) {
    return this.surfaces[id];
  }
  addArc(arc) {
    const {id} = arc;
    if (id && !this.arcs[id]) {
      return this.arcs[id] = arc;
    }
    throw `arc has no id, or id ["${id}"] is already in use `;
  }
  async marshalParticle(host, particleMeta) {
    const particle = await this.createParticle(host, particleMeta.kind);
    host.installParticle(particle, particleMeta);
  }
  addStore(storeId, store) {
    if (store.marshal) {
      store.marshal(store);
    }
    if (store.persistor) {
      store.persistor.persist = store => this.persistor?.persist(storeId, store);
    }
    store.listen('change', this.storeChanged.bind(this, storeId), `${storeId}-changed`);
    this.stores[storeId] = store;
    this.maybeShareStore(storeId);
    this.fire('store-added', store);
  }
  removeStore(storeId) {
    const store = this.stores[storeId];
    store?.unlisten('change', `${storeId}-changed`);
    delete this.stores[storeId];
  }
  //
  maybeShareStore(storeId) {
    const store = this.stores[storeId];
    if (store.is('shared')) {
      this.shareStore(storeId);
    }
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
    const store = this.stores[storeId];
    const nid = this.uid.replace(/\./g, '_');
    if (!store.is('private') || (peerId.startsWith(nid))) {
      this.shareStoreWithPeer(storeId, peerId);
    }
  }
  protected shareStoreWithPeer(storeId, peerId) {
    this.network?.shareStore(storeId, peerId);
  }
  protected storeChanged(storeId, store) {
    this.log('storeChanged', storeId);
    this.network?.invalidatePeers(storeId);
    this.onStoreChange(storeId, store);
    this.fire('store-changed', store);
  }
  protected onStoreChange(storeId, store) {
    // override for bespoke response
  }
  protected async createParticle(host, kind): Promise<unknown> {
    try {
      const factory = await this.marshalParticleFactory(kind);
      return factory(host);
    } catch(x) {
      log.error(`createParticle(${kind}):`, x);
    }
  }
  protected async marshalParticleFactory(kind: string): Promise<ParticleFactory> {
    return particleFactoryCache[kind] ?? this.lateBindParticle(kind);
  }
  protected async lateBindParticle(kind: string): Promise<unknown> {
    return Runtime.registerParticleFactory(kind, Runtime?.particleIndustry(kind, Runtime.particleOptions));
  }
  protected static registerParticleFactory(kind, factoryPromise: Promise<unknown>) {
    return particleFactoryCache[kind] = factoryPromise;
  }
  requireStore(meta): Store {
    let store = this.stores[meta.name];
    if (!store) {
      store = this.createStore(meta);
      this.addStore(meta.name, store);
    }
    return store;
  }
  createStore(meta) {
    const key = keys(storeFactories).find(tag => meta.tags?.includes?.(tag));
    const storeClass = storeFactories[key] || Store;
    return new storeClass(meta);
  }
  static registerStoreClass(tag, storeClass) {
    storeFactories[tag] = storeClass;
  }
}
