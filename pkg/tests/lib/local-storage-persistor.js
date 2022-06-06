/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../../arcsjs-core.js';

const logIn = logFactory(logFactory.flags.storage, 'storage(in)', 'limegreen');
const logOut = logFactory(logFactory.flags.storage, 'storage(out)', 'darkgreen');

// LocalStorage persistence for Store objects

export const LocalStoragePersistor = class {
  constructor(prefix) {
    this.prefix = prefix;
  }
  get path() {
    return this.prefix;
  }
  getKey(id) {
    return `${this.path}${id ? `/${id}` : ''}`;
  }
  async persist(id, store) {
    const key = this.getKey(id);
    const serial = store.save();
    if (serial) {
      logOut(`${key}: serialized [${(serial.length/1024).toFixed(2)}Kb]`);
      localStorage.setItem(key, serial);
    }
  }
  async restore(id, store, defaultValue) {
    const key = this.getKey(id);
    const serial = localStorage.getItem(key);
    store.load(serial, defaultValue);
    if (serial) {
      logIn(`${key}: restored [${(serial.length/1024).toFixed(2)}Kb]`);
    }
  }
};