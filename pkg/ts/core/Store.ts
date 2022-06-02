/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {EventEmitter} from './EventEmitter.js';
import {Tag, StoreMeta} from './types.js';

const {create, keys} = Object;
const {stringify, parse} = JSON;

export class DataStore extends EventEmitter {
  private privateData;
  constructor() {
    super();
  }
  protected setPrivateData(data) {
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
  get json(): string {
    return stringify(this.data);
  }
  set json(json) {
    let value = null;
    try {
      value = parse(json);
    } catch(x) {
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
  protected change(mutator) {
    mutator(this);
    this.doChange();
  }
  protected doChange() {
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
  set(key: string, value: any) {
    if (!this.data) {
      this.setPrivateData(create(null));
    }
    if (value !== undefined) {
      this.change(self => self.data[key] = value);
    } else {
      this.delete(key);
    }
  }
  delete(key: string): void {
    this.change(doc => delete doc.data[key]);
  }
  // assign(dictionary: Dictionary<any>) {
  //   this.change(doc => shallowMerge(doc.data, dictionary));
  // }
}

class PersistableStore extends ObservableStore {
  meta: Partial<StoreMeta>;
  persistor;
  protected willPersist;
  constructor(meta: StoreMeta) {
    super();
    this.meta = {...meta};
  }
  toString() {
    return `${JSON.stringify(this.meta, null, '  ')}, ${this.pretty}`;
  }
  get tags(): Tag[] {
    return this.meta.tags ?? (this.meta.tags = []);
  }
  is(...tags: Tag[]): boolean {
    // true if every member of `tags` is also in `this.tags`
    return tags.every(tag => this.tags.includes(tag));
  }
  isCollection(): boolean {
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
  async restore(value: any) {
    const restored = await this.persistor?.restore(this);
    if (!restored && (value !== undefined)) {
      this.data = value;
    }
  }
  delete() {
    this.persistor?.remove(this);
  }
  save(): string {
    return this.json;
  }
  load(serial: string, defaultValue) {
    let value = defaultValue;
    try {
      if (serial) {
        value = parse(serial);
      }
    } catch(x) {
      //
    }
    if (value !== undefined) {
      this.data = value;
    }
    //this.setPrivateData(value);
  }
}

export class Store extends PersistableStore {}
