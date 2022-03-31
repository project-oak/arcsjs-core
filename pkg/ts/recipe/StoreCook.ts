/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {logFactory} from '../utils/log.js';
import {Runtime} from '../Runtime.js';

const log = logFactory(logFactory.flags.recipe, 'StoreCook', '#187e13');

export type StoreSpec = {
  $type: string;
  $value?;
  //$tags?: [string];
};

const {values} = Object;

export const matches = (storeMeta, targetMeta) => {
  for (const property in targetMeta) {
    if (storeMeta[property] !== targetMeta[property]) {
      return false;
    }
  }
  return true;
};

const findStores = (runtime: Runtime, criteria) => {
  return values(runtime.stores).filter(store => matches(store.meta, criteria));
};

const mapStore = (runtime: Runtime, {name, type}) => {
  return findStores(runtime, {name, type})?.[0];
};

export class StoreCook {
  static async execute(runtime, arc, plan) {
    return StoreCook.forEachStore(runtime, arc, plan, StoreCook.realizeStore);
  }
  static async evacipate(runtime, arc, plan) {
    return StoreCook.forEachStore(runtime, arc, plan, StoreCook.derealizeStore);
  }
  static async forEachStore(runtime, arc, plan, func) {
    return Promise.all(plan.stores.map(store => func(runtime, arc, store)));
  }
  static async realizeStore(runtime, arc, spec) {
    const meta = StoreCook.constructMeta(runtime, arc, spec);
    let store = mapStore(runtime, meta);
    if (!store) {
      //log.error('realizeStore: mapStore returned null');
    } else {
      log(`realizeStore: mapped "${spec.$name}" to "${store.meta.name}"`);
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
    }
    arc.addStore(meta.name, store);
  }
  static async derealizeStore(runtime, arc, spec) {
    runtime.removeStore(spec.$name);
    arc.removeStore(spec.$name);
  }
  static constructMeta(runtime, arc, spec) {
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
