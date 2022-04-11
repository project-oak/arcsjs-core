/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {logFactory} from '../utils/log.js';
import {matches} from '../utils/matching.js';
import {Runtime} from '../Runtime.js';
import {StoreSpec, Plan} from './types.js';
import {Arc} from '../core/Arc.js';
import {StoreMeta} from '../core/types.js';

const log = logFactory(logFactory.flags.recipe, 'StoreCook', '#187e13');

const {values} = Object;

type StoreMapFunc<T> = (runtime: Runtime, arc: Arc,store: {}) => T;

const findStores = (runtime: Runtime, criteria: Partial<StoreMeta>) => {
  return values(runtime.stores).filter(store => matches(store.meta, criteria));
};

const mapStore = (runtime: Runtime, {name, type}) => {
  return findStores(runtime, {name, type})?.[0];
};

export class StoreCook {
  static async execute(runtime: Runtime, arc: Arc, plan: Plan) {
    return StoreCook.forEachStore(runtime, arc, plan, StoreCook.realizeStore);
  }
  static async evacipate(runtime: Runtime, arc: Arc, plan: Plan) {
    return StoreCook.forEachStore(runtime, arc, plan, StoreCook.derealizeStore);
  }
  static async forEachStore<T>(runtime: Runtime, arc: Arc, plan: Plan, func: StoreMapFunc<T>): Promise<T[]> {
    return Promise.all(plan.stores.map(store => func(runtime, arc, store)));
  }
  static async realizeStore(runtime: Runtime, arc: Arc, spec: StoreSpec) {
    const meta = StoreCook.constructMeta(runtime, arc, spec);
    let store = mapStore(runtime, meta);
    if (!store) {
      //log.error('realizeStore: mapStore returned null');
    } else {
      log(`realizeStore: mapped "${spec.name}" to "${store.meta.name}"`);
    }
    if (!store) {
      store = runtime.createStore(meta);
      // TODO(sjmiles): Stores no longer know their own id, so there is a wrinkle here as we
      // re-route persistence through runtime (so we can bind in the id)
      // Also: the 'id' is known as 'meta.name' here, this is also a problem
      store.persistor = {
        restore: store => runtime.persistor?.restore(meta.name, store),
        persist: () => {}
      };
      runtime.addStore(meta.name, store);
      await store.restore(meta?.value);
      log(`realizeStore: created "${meta.name}"`);
    } else {
      log(`realizeStore: mapped to "${meta.name}", setting data to:`, meta?.value);
      store.data = meta?.value;
    }
    arc.addStore(meta.name, store);
  }
  static async derealizeStore(runtime: Runtime, arc: Arc, spec: StoreSpec) {
    runtime.removeStore(spec.name);
    arc.removeStore(spec.name);
  }
  static constructMeta(runtime: Runtime, arc: Arc, spec: StoreSpec): StoreMeta {
    const meta = {
      ...spec,
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
