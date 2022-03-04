/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Automerge} from '../../third_party/automerge/automerge.js';
import {Store} from '../core/Store.js';
import {deepCopy} from '../utils/object.js';
import {logFactory} from '../utils/log.js';
import {Runtime} from '../Runtime.js';

const log = logFactory(logFactory.flags.automerge, 'AutomergeStore', 'crimson');

const {init, change, load, getLastLocalChange} = Automerge;

export class AutomergeStore extends Store {
  crdt;
  constructor(meta) {
    super(meta);
    this.crdt = this.initDefaultStateDoc({});
  }
  get data() {
    return this.crdt.data;
  }
  set data(data) {
    this.change(doc => doc.data = data);
  }
  private initDefaultStateDoc(state) {
    //return from({data: state});
    return load(getLastLocalChange(change(init('0000'), {time: 0}, doc => doc.data = state)));
  }
  get pojo() {
    return deepCopy(this.data);
  }
  protected change(mutator) {
    if (!this.crdt) {
      throw 'null crdt';
    }
    this.setCrdt(change(this.crdt, mutator));
  }
  setCrdt(crdt) {
    if (crdt !== this.crdt) {
      log(`[${this.meta.name}] crdt changed, invoking doChange`);
      this.crdt = crdt;
      this.doChange();
    }
  }
  save() {
    const uint8s = Automerge.save(this.crdt);
    const ascii = btoa(uint8s);
    return ascii;
  }
  load(data) {
    const bytes = JSON.parse(`[${atob(data)}]`);
    const uint8s = new Uint8Array(bytes);
    this.crdt = Automerge.load(uint8s);
  }
}

Runtime.registerStoreClass('crdt', AutomergeStore);
