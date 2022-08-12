/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { EventEmitter } from './EventEmitter.js';
const { create, keys } = Object;
const { stringify, parse } = JSON;
export class DataStore extends EventEmitter {
    privateData;
    constructor() {
        super();
    }
    setPrivateData(data) {
        this.privateData = data;
    }
    set data(data) {
        this.setPrivateData(data);
    }
    get data() {
        return this.privateData;
    }
    toString() {
        return this.pretty;
    }
    get isObject() {
        return this.data && typeof this.data === 'object';
    }
    get pojo() {
        return this.data;
    }
    get json() {
        return stringify(this.data);
    }
    set json(json) {
        let value = null;
        try {
            value = parse(json);
        }
        catch (x) {
            //
        }
        this.data = value;
    }
    get pretty() {
        const sorted = {};
        const pojo = this.pojo;
        keys(pojo).sort().forEach(key => sorted[key] = pojo[key]);
        return stringify(sorted, null, '  ');
    }
}
class ObservableStore extends DataStore {
    change(mutator) {
        mutator(this);
        this.doChange();
    }
    doChange() {
        this.fire('change', this);
        this.onChange(this);
    }
    onChange(store) {
        // override
    }
    set data(data) {
        this.change(self => self.setPrivateData(data));
    }
    // TODO(sjmiles): one of the compile/build/bundle tools
    // evacipates the inherited getter, so we clone it
    get data() {
        return this['privateData'];
    }
    set(key, value) {
        if (!this.data) {
            this.setPrivateData(create(null));
        }
        if (value !== undefined) {
            this.change(self => self.data[key] = value);
        }
        else {
            this.delete(key);
        }
    }
    delete(key) {
        this.change(doc => delete doc.data[key]);
    }
}
class PersistableStore extends ObservableStore {
    meta;
    persistor;
    willPersist;
    constructor(meta) {
        super();
        this.meta = { ...meta };
    }
    toString() {
        return `${JSON.stringify(this.meta, null, '  ')}, ${this.pretty}`;
    }
    get tags() {
        return this.meta.tags ?? (this.meta.tags = []);
    }
    is(...tags) {
        // true if every member of `tags` is also in `this.tags`
        return tags.every(tag => this.tags.includes(tag));
    }
    isCollection() {
        return this.meta.type?.[0] === '[';
    }
    async doChange() {
        // do not await
        this.persist();
        return super.doChange();
    }
    async persist() {
        // persists at most every 500ms
        if (!this.willPersist && this.persistor) {
            this.willPersist = true;
            setTimeout(() => {
                this.willPersist = false;
                this.persistor.persist(this);
            }, 500);
        }
    }
    async restore(value) {
        const restored = await this.persistor?.restore(this);
        if (!restored && (value !== undefined)) {
            this.data = value;
        }
    }
    delete() {
        this.persistor?.remove(this);
    }
    save() {
        return this.json;
    }
    load(serial, defaultValue) {
        let value = defaultValue;
        try {
            if (serial) {
                value = parse(serial);
            }
        }
        catch (x) {
            //
        }
        if (value !== undefined) {
            this.data = value;
            //this.setPrivateData(value);
        }
    }
}
export class Store extends PersistableStore {
}
