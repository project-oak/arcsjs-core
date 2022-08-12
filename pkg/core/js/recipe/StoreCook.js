/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { logFactory } from '../utils/log.js';
import { matches } from '../utils/matching.js';
const log = logFactory(logFactory.flags.recipe, 'StoreCook', '#187e13');
const { values } = Object;
const findStores = (runtime, criteria) => {
    return values(runtime.stores).filter(store => matches(store?.meta, criteria));
};
const mapStore = (runtime, { name, type }) => {
    return findStores(runtime, { name, type })?.[0];
};
export class StoreCook {
    static async execute(runtime, arc, stores) {
        return this.forEachStore(this.realizeStore, runtime, arc, stores);
    }
    static async evacipate(runtime, arc, stores) {
        return this.forEachStore(this.derealizeStore, runtime, arc, stores);
    }
    static async forEachStore(task, runtime, arc, stores) {
        return Promise.all(stores.map(store => task.call(this, runtime, arc, store)));
    }
    static async realizeStore(runtime, arc, rawMeta) {
        const meta = this.constructMeta(runtime, arc, rawMeta);
        let store = mapStore(runtime, meta);
        if (!store) {
            //log.error('realizeStore: mapStore returned null');
        }
        else {
            log(`realizeStore: mapped "${rawMeta.name}" to "${store.meta.name}"`);
        }
        if (!store) {
            store = runtime.createStore(meta);
            // TODO(sjmiles): Stores no longer know their own id, so there is a wrinkle here as we
            // re-route persistence through runtime (so we can bind in the id)
            // Also: the 'id' is known as 'meta.name' here, this is also a problem
            store && (store.persistor = {
                restore: store => runtime.persistor?.restore(meta.name, store),
                persist: () => { }
            });
            runtime.addStore(meta.name, store);
            await store?.restore(meta?.value);
            log(`realizeStore: created "${meta.name}"`);
        }
        else {
            log(`realizeStore: mapped to "${meta.name}", setting data to:`, meta?.value);
            if (meta?.value !== undefined) {
                store.data = meta?.value;
            }
        }
        arc.addStore(meta.name, store);
    }
    static async derealizeStore(runtime, arc, spec) {
        runtime.removeStore(spec.$name);
        arc.removeStore(spec.$name);
    }
    static constructMeta(runtime, arc, rawMeta) {
        const meta = {
            ...rawMeta,
            arcid: arc.id,
            uid: runtime.uid,
        };
        return {
            ...meta,
            owner: meta.uid,
            shareid: `${meta.name}:${meta.arcid}:${meta.uid}`
        };
    }
}
