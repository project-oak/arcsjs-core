/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../core.js';

const {config} = globalThis;
const aeonPath = `/${config.aeon}`;

const log = logFactory(logFactory.flags.storage, 'storage', 'limegreen');

export const Persistor = class {
  constructor(uid) {
    this.uid = uid;
  }
  get path() {
    return `${this.uid}${aeonPath}`;
  }
  getKey(id) {
    return `${this.path}/${id}`;
  }
  async persist(id, serial) {
    const key = this.getKey(id);
    if (serial) {
      this.upload(key, serial);
      log(`${key}: serialized [${(serial.length/1024).toFixed(2)}Kb]`);
      localStorage.setItem(key, serial);
    }
  }
  async restore(id, store) {
    const key = this.getKey(id);
    const serial = this.download(key);
    log(`${key}: restored [${(serial.length/1024).toFixed(2)}Kb]`);
    return serial;
  }
};

// LocalStorage persistence for Store objects
export const LocalStoragePersistor = class extends Persistor {
  upload(key, serial) {
    localStorage.setItem(key, serial);
  }
  async download(key) {
    return localStorage.getItem(key);
  }
};
