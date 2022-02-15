/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {EventEmitter} from './EventEmitter.js';
import {shallowMerge} from '../utils/object.js';
import {key} from '../utils/rand.js';

const {values, keys, entries} = Object;
const {stringify} = JSON;

class RawStore extends EventEmitter {
  protected _data;
  constructor() {
    super();
    this._data = {};
  }
  get data() {
    return this._data;
  }
  set data(data) {
    this.change(doc => doc._data = data);
  }
  get pojo() {
    return this.data;
  }
  get json() {
    return stringify(this.data);
  }
  get pretty() {
    const sorted = {};
    this.keys.sort().forEach(key => sorted[key] = this.get(key));
    return stringify(sorted, null, '  ');
  }
  get keys() {
    return keys(this.data);
  }
  get length() {
    return keys(this.data).length;
  }
  get values() {
    return values(this.data);
  }
  get entries() {
    return entries(this.data);
  }
  protected change(mutator) {
    mutator(this);
    this.doChange();
  }
  doChange() {
    this.fire('change', this);
    this.onChange(this);
  }
  set(key, value) {
    if (value !== undefined) {
      this.change(doc => doc.data[key] = value);
    } else {
      this.delete(key);
    }
  }
  push(...values) {
    const keyString = () => `key_${key(12)}`;
    this.change(doc => values.forEach(value => doc.data[keyString()] = value));
  }
  removeValue(value) {
    this.entries.find(([key, entry]) => {
      if (entry === value) {
        this.delete(key);
        return true;
      }
    });
  }
  has(key) {
    return this.data[key] !== undefined;
  }
  get(key) {
    return this.data[key];
  }
  getByIndex(index) {
    return this.data[this.keys[index]];
  }
  delete(key) {
    this.change(doc => doc.data?.[key] && delete doc.data[key]);
  }
  deleteByIndex(index) {
    this.delete(this.keys[index]);
  }
  assign(dictionary) {
    this.change(doc => shallowMerge(doc.data, dictionary));
  }
  clear() {
    this.change(doc => doc.data = {});
  }
  onChange(store) {
  }
}

export type StoreMeta = {
  arcid: string,
  name: string,
  type: string,
  owner: string,
  tags?: string[]
};

export class Store extends RawStore {
  meta;
  persistor;
  constructor(meta: StoreMeta) {
    super();
    this.meta = meta || {};
  }
  isCollection() {
    return this.meta.type?.[0] === '[';
  }
  get tags() {
    return this.meta.tags || (this.meta.tags = []);
  }
  is(...tags) {
    // false if any member of `tags` in not also in `this.tags`
    return !tags.find(tag => !this.tags.includes(tag));
  }
  async doChange() {
    super.doChange();
    // do not await
    this.persist();
  }
  async persist() {
    this.persistor?.persist(this);
  }
  async restore(value) {
    const restored = await this.persistor?.restore(this);
    if (!restored) {
      this.data = value !== undefined ? value : this.getDefaultValue();
    }
  }
  getDefaultValue() {
    return this.isCollection() ? {} : '';
  }
  async remove() {
    this.persistor?.remove(this);
  }
  save() {
    return this.json;
  }
  load(value) {
    try {
      this.data = JSON.parse(value);
    } catch(x) {
      //
    }
  }
}
