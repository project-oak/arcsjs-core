/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Store } from './Store.js';
import { debounce } from '../utils/task.js';
import { matches } from '../utils/matching.js';
// TODO(sjmiles): layer violation: promote this module out of core/
import { Runtime } from '../Runtime.js';
export class AggregateStore extends Store {
    criteria;
    stores;
    debounceKey;
    constructor(meta) {
        super(meta);
        this.stores = [];
        this.criteria = { name: this.nameFromTags(), type: meta.type };
        this.setPrivateData([]);
    }
    nameFromTags() {
        // The aggregate store meta will contain `name:storeName` tag.
        return this.tags.map(t => (t.match(/^name:(.*)$/) || [])[1]).filter(t => t)[0];
    }
    onContextAdd(store) {
        this.addMapped([store]);
    }
    onContextChanged(store) {
        if (this.hasStore(store)) {
            this.invalidateStore();
        }
    }
    addMapped(stores) {
        const matching = store => matches(store.meta, this.criteria);
        const matchingStores = stores?.filter(matching);
        if (matchingStores?.length > 0) {
            this.pushStores(matchingStores);
            this.invalidateStore();
        }
    }
    pushStores(stores) {
        const newStores = stores.filter(store => !this.hasStore(store));
        if (newStores.length > 0) {
            this.stores.push(...newStores);
        }
    }
    invalidateStore() {
        this.debounceKey = debounce(this.debounceKey, () => this.aggregateStores(), 40);
    }
    async aggregateStores() {
        this.debounceKey = null;
        const aggregate = this.stores
            .map((store) => store?.data)
            .filter(data => data && Array.isArray(data))
            .flat();
        this.change(doc => doc.data = aggregate);
    }
    // TODO(mariakleiner): figure out save/load
    save() {
        //return this.stores.map(({meta}) => meta);
        return '';
    }
    hasStore(store) {
        return this.stores.some(({ meta }) => meta.name === store.meta.name);
    }
    // TODO(sjmiles): try to roll this stuff into persistor logic
    marshal(runtime) {
        this.addMapped(Object.values(this.stores));
        runtime.listen('store-added', s => this.onContextAdd(s));
        runtime.listen('store-changed', s => this.onContextChanged(s));
        // TODO(sjmiles): I think 'restore' is the wrong name, since we use that for persistence
        this.rebuild(runtime);
    }
    rebuild(runtime) {
        // TODO(sjmiles): why store.meta.value?
        const metas = this.meta?.value;
        // turn metas into Stores
        const stores = metas.map(meta => runtime.requireStore(meta));
        this.addMapped(stores);
    }
}
Runtime.registerStoreClass('aggregate', AggregateStore);
