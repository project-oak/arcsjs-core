/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {EventEmitter} from './EventEmitter.js';
import {shallowMerge, Dictionary} from '../utils/object.js';
import {key} from '../utils/rand.js';
import {Tag} from '../recipe/Specs.js';

const {values, keys, entries} = Object;
const {stringify} = JSON;

class RawStore extends EventEmitter {
  protected _data: any;
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
  get isObject() {
    return this.data && typeof this.data === 'object';
  }
  get pojo() {
    return this.data;
  }
  get json(): string {
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
  protected change(mutator: (doc: RawStore) => void) {
    mutator(this);
    this.doChange();
  }
  doChange() {
    this.fire('change', this);
    this.onChange(this);
  }
  set(key: string, value: any) {
    if (value !== undefined) {
      this.change(doc => doc.data[key] = value);
    } else {
      this.delete(key);
    }
  }
  push(...values: any[]) {
    const keyString = () => `key_${key(12)}`;
    this.change(doc => values.forEach(value => doc.data[keyString()] = value));
  }
  removeValue(value: any): void {
    this.entries.find(([key, entry]) => {
      if (entry === value) {
        this.delete(key);
        return true;
      }
    });
  }
  has(key: string): boolean {
    return this.data[key] !== undefined;
  }
  get(key: string): any {
    return this.data[key];
  }
  getByIndex(index: number): any {
    return this.data[this.keys[index]];
  }
  delete(key: string): void {
    this.change(doc => doc.data?.[key] && delete doc.data[key]);
  }
  deleteByIndex(index: number): void {
    this.delete(this.keys[index]);
  }
  assign(dictionary: Dictionary<any>) {
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
  tags?: string[],
  value?: any,
  shareid?: string,
};

export class Store extends RawStore {
  meta: Partial<StoreMeta>;
  persistor;
  willPersist = false;
  constructor(meta: StoreMeta) {
    super();
    this.meta = meta || {};
  }
  isCollection(): boolean {
    return this.meta.type?.[0] === '[';
  }
  get tags(): Tag[] {
    return this.meta.tags || (this.meta.tags = []);
  }
  is(...tags: Tag[]): boolean {
    // false if any member of `tags` in not also in `this.tags`
    return !tags.find(tag => !this.tags.includes(tag));
  }
  async doChange() {
    super.doChange();
    // do not await
    this.persist();
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
  save(): string {
    return this.json;
  }
  load(value: string) {
    try {
      this.data = JSON.parse(value);
    } catch(x) {
      //
    }
  }
}
