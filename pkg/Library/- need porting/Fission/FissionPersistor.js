/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../../arcsjs-support.js';
import {FissionPromise} from './fission.js';

const {config} = globalThis;
const aeonPath = `/${config.aeon}`;

const logIn = logFactory(logFactory.flags.storage, 'storage', 'limegreen');
const logOut = logFactory(logFactory.flags.storage, 'storage', 'darkgreen');

// Firebase disallows `[].` (Fission?)
const cleanKey = id => id.replace(/\[/g, '(').replace(/]/g, ')').replace(/[.]/g, '_');

// Fission persistence for Store objects
export const FissionPersistor = class {
  constructor(owner) {
    this.owner = owner;
  }
  get path() {
    return `${this.owner.uid}${aeonPath}`;
  }
  async getNode(id) {
    return (await Storage).db.ref(
      cleanKey(`${this.path}/${id}`)
    );
  }
  ignore(store) {
    return !store.is('persisted') || store.is('volatile');
  }
  async persist(id, store) {
    // TODO(sjmiles): should be elsewhere
    if (!this.ignore(store)) {
      const {wn, state: {fs}} = await FissionPromise;
      const aeon = config.aeon.replace('/', ':');
      const path = wn.path.file("private", "FissionSmoke", "Private", aeon, `${id}.json`);
      const serial = store.save();
      if (typeof serial == 'string') {
        await fs.write(path, serial);
        logOut(path, serial, `[${(serial?.length/1024 || 0).toFixed(2)}Kb]`);
        this.publish(fs);
      }
    }
  }
  publish(fs) {
    // don't publish more than once a second
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.timeout = false;
        fs.publish();
      }, 5000);
    }
  }
  async restore(id, store) {
    if (!this.ignore(store)) {
      const {wn, state: {fs}} = await FissionPromise;
      const aeon = config.aeon.replace('/', ':');
      const path = wn.path.file("private", "FissionSmoke", "Private", aeon, `${id}.json`);
      if (await fs.exists(path)) {
        const serial = await fs.cat(path);
        if (serial) {
          store.load(serial);
          logIn(`${id}: restored [${(serial.length/1024).toFixed(2)}Kb]`);
          return true;
        }
      }
    }
    return false;
  }
  async remove(id, store) {
  //   if (!store.is('volatile') && store.is('persisted')) {
  //     const node = await this.getNode(id);
  //     if (node) {
  //       node.remove();
  //     }
  //     logOut(`Deleted ${node.key}.`);
  //   }
  }
};
