/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Arc } from './core/Arc.js';
import { Host } from './core/Host.js';
import { Store } from './core/Store.js';
import { EventEmitter } from './core/EventEmitter.js';
import { ArcMeta, ParticleMeta, StoreMeta } from './core/types.js';
import { Dictionary, Logger } from './utils/types.js';
declare type UID = string;
export declare type ParticleFactory = (kind: string) => Promise<unknown>;
export declare class Runtime extends EventEmitter {
    log: Logger;
    uid: UID;
    nid: UID;
    arcs: Dictionary<Arc>;
    stores: Dictionary<Store>;
    peers: Set<string>;
    shares: Set<string>;
    endpoint: any;
    network: any;
    surfaces: any;
    persistor: any;
    prettyUid: any;
    static securityLockdown: any;
    static particleIndustry: any;
    static particleOptions: any;
    constructor(uid: any);
    setUid(uid: UID): void;
    bootstrapArc(name: string, meta: ArcMeta, surface: any, service: any): Promise<Arc>;
    serviceFactory(service: any): (host: any, request: any) => Promise<any>;
    bootstrapParticle(arc: any, id: any, meta: ParticleMeta): Promise<any>;
    addSurface(id: any, surface: any): void;
    getSurface(id: any): any;
    addArc(arc: any): any;
    removeArc(arc: any): void;
    marshalParticle(host: any, particleMeta: ParticleMeta): Promise<void>;
    installParticle(arc: any, particleMeta: ParticleMeta, name?: any): Promise<Host>;
    addStore(storeId: any, store: any): void;
    protected storeChanged(storeId: any, store: any): void;
    protected onStoreChange(storeId: any, store: any): void;
    protected do(storeId: any, task: any): void;
    removeStore(storeId: any): void;
    maybeShareStore(storeId: any): void;
    addPeer(peerId: any): void;
    shareStore(storeId: any): void;
    protected maybeShareStoreWithPeer(storeId: any, peerId: any): void;
    protected shareStoreWithPeer(storeId: any, peerId: any): void;
    protected createParticle(host: any, kind: any): Promise<unknown>;
    protected marshalParticleFactory(kind: string): Promise<ParticleFactory>;
    protected lateBindParticle(kind: string): Promise<unknown>;
    protected static registerParticleFactory(kind: any, factoryPromise: Promise<unknown>): Promise<unknown>;
    requireStore(meta: StoreMeta): Store | undefined;
    createStore(meta: StoreMeta): any;
    static registerStoreClass(tag: any, storeClass: any): void;
}
export {};
