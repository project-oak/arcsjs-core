/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../utils/log.js';

const log = logFactory(logFactory.flags.recipe, 'flan', 'violet');

const {entries, create} = Object;

export class Parser {
  stores;
  particles;
  slots;
  meta;
  constructor(recipe) {
    this.stores = [];
    this.particles = [];
    this.slots = [];
    this.meta = create(null);
    if (recipe) {
      this.parse(recipe);
    }
  }
  parse(recipe) {
    // `normalize` converts shorthand to longhand before parsing
    // TODO(sjmiles): would be great if `normalize` normalized all the things
    const normalized = this.normalize(recipe);
    this.parseSlotSpec(normalized, 'root', '');
    //log(this);
    return this;
  }
  normalize(recipe) {
    if (typeof recipe !== 'object') {
      throw Error('recipe must be an Object');
    }
    return recipe;
  }
  // spec is a SlotSpec
  parseSlotSpec(spec, slotName, parentName) {
    // record this slot
    this.slots.push({...spec, $name: slotName, $parent: parentName});
    // process entries
    for (const key in spec) {
      const info = spec[key];
      switch (key) {
        case '$meta':
          // value is a dictionary
          this.meta = {...this.meta, ...info};
          break;
        case '$stores':
          // value is a StoreSpec
          this.parseStoresNode(info);
          break;
        default: {
          // value is a ParticleSpec
          const container = parentName ? `${parentName}#${slotName}` : slotName;
          this.parseParticleSpec(container, key, info);
          break;
        }
      }
    }
  }
  parseStoresNode(stores) {
    for (const key in stores) {
      this.parseStoreSpec(key, stores[key]);
    }
  }
  parseStoreSpec(name, spec) {
    if (this.stores.find(s => s.name === name)) {
      log('duplicate store name');
      return;
    }
    const meta = {
      name,
      type: spec.$type,
      tags: spec.$tags,
      value: spec.$value
    };
    this.stores.push(meta);
  }
  parseParticleSpec(container, id, spec) {
    if (!spec.$kind) {
      log.warn(`parseParticleSpec: malformed spec has no "kind":`, spec);
      throw Error();
    }
    if (this.particles.find(s => s.id === id)) {
      log('duplicate particle name');
      return;
    }
    //log('pushing ', id);
    this.particles.push({id, container, spec});
    if (spec.$slots) {
      this.parseSlotsNode(spec.$slots, id);
    }
  }
  parseSlotsNode(slots, parent) {
    return Promise.all(entries(slots).map(([key, spec]) => {
      this.parseSlotSpec(spec, key, parent);
    }));
  }
}
