/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {logFactory} from '../utils/log.js';
import {matches} from '../utils/matching.js';
import {Runtime} from '../Runtime.js';
import {Arc} from '../core/Arc.js';
import {StoreMeta, StoreSpec} from './types.js';

const log = logFactory(logFactory.flags.recipe, 'StoreCook', '#99bb15');

const {values} = Object;

const mapStore = (runtime: Runtime, {name, type}) => {
  return findStores(runtime, {name, type})?.[0];
};

const findStores = (runtime: Runtime, criteria: Partial<StoreMeta>) => {
  return values(runtime.stores).filter(store => storeMatches(store, criteria));
};

const storeMatches = (store, criteria: Partial<StoreMeta>) => {
  // TODO(b/244191110): Type matching API to be wired here.
  const {type, ...other} = criteria;
  if (typeMatches(type, store?.meta.type)) {
    // generic object comparison
    return matches(store?.meta, other);
  }
};

const typeMatches = (typeA, typeB) => {
  const baseTypes = ['pojo','json'];
  return (typeA === typeB)
    || baseTypes.includes(typeA?.toLowerCase())
    || baseTypes.includes(typeB?.toLowerCase())
    ;
};

export type StoreMapFunc = (runtime: Runtime, arc: Arc, store) => void;

export class StoreCook {
  static async execute(runtime: Runtime, arc: Arc, stores: StoreMeta[]) {
    return this.forEachStore(this.realizeStore, runtime, arc, stores);
  }
  static async evacipate(runtime: Runtime, arc: Arc, stores: StoreMeta[]) {
    return this.forEachStore(this.derealizeStore, runtime, arc, stores);
  }
  static async forEachStore(task: StoreMapFunc, runtime: Runtime, arc: Arc, stores: StoreMeta[]): Promise<any[]> {
    return Promise.all(stores.map(store => task.call(this, runtime, arc, store)));
  }
  static async realizeStore(runtime: Runtime, arc: Arc, rawMeta: StoreMeta) {
    // potential initialization value
    let value;
    // build a StoreMeta out of parts
    const meta = this.constructMeta(runtime, arc, rawMeta);
    // do we already own this Store?
    let store = mapStore(runtime, meta);
    if (store) {
      // use a Store
      log(`realizeStore: mapping "${rawMeta.name}" to "${store.meta.name}"`);
    } else {
      log(`realizeStore: creating "${meta.name}"`);
      // create a Store
      store = StoreCook.createStore(runtime, meta);
      // default initial value comes from meta
      value = meta?.value;
      // persisted value may override default
      if (store.shouldPersist()) {
        const cached = await store.restore();
        value = (cached == null) ? value : cached;
      }
    }
    // we have a store for the Arc now
    arc.addStore(meta.name, store);
    // it may need a starting value
    if (value !== undefined) {
      log(`setting data to:`, value);
      store.data = value;
    }
  }
  static createStore(runtime: Runtime, meta: StoreMeta) {
    // we need to create this Store
    const store = runtime.createStore(meta);
    runtime.addStore(meta.name, store);
    return store;
  }
  static async derealizeStore(runtime: Runtime, arc: Arc, spec: StoreSpec) {
    runtime.removeStore(spec.$name);
    arc.removeStore(spec.$name);
  }
  static constructMeta(runtime: Runtime, arc: Arc, rawMeta: StoreMeta): StoreMeta {
    const meta = {
      ...rawMeta,
      arcid: arc.id,
      uid: runtime.uid,
    };
    return {
      ...meta,
      owner: meta.uid, // BC?
      shareid: `${meta.name}:${meta.arcid}:${meta.uid}`
    };
  }
}
