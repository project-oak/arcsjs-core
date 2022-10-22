/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../Core/core.js';

const log = logFactory(logFactory.flags.storage, 'storage', 'limegreen');
const len = serial => !serial?.length ? 'n/a' : `${(serial.length/1024).toFixed(2)}Kb`;

export const Persistor = class {
  constructor(uid) {
    this.uid = uid;
  }
  get path() {
    return `${this.uid}/${globalThis.config?.aeon || 'missing'}`;
  }
  getKey(id) {
    return `${this.path}/${id}`;
  }
  async persist(id, store) {
    let serial;
    const data = store?.data;
    if (id && data) {
      const key = this.getKey(id);
      try {
        serial = JSON.stringify(data);
      } catch(x) {
        log.warn(x);
      }
      if (serial) {
        log(`[${key}]\nPERSIST [${len(serial)}]`);
        this.upload(key, serial);
      }
    }
  }
  async restore(id) {
    let data;
    if (id) {
      const key = this.getKey(id);
      const serial = await this.download(key);
      log(`[${key}]\nRESTORE [${len(serial)}]`);
      try {
        data = JSON.parse(serial);
      } catch(x) {
        log.warn(x);
      }
    }
    return data;
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
