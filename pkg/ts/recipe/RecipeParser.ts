/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {logFactory} from '../utils/log.js';
import {Dictionary, SlotSpec, Recipe, Container, StoreSpec, ParticleSpec, ParticleId, Slot} from './types.js';

const log = logFactory(logFactory.flags.recipe, 'flan', 'violet');

const {entries, create} = Object;

export class Parser {
  stores: any[];
  particles: {id: ParticleId, container: Container, spec: ParticleSpec}[];
  slots: Slot[];
  meta: any;
  constructor(recipe: Recipe) {
    this.stores = [];
    this.particles = [];
    this.slots = [];
    this.meta = create(null);
    if (recipe) {
      this.parse(recipe);
    }
  }
  parse(recipe: Recipe): Parser {
    // `normalize` converts shorthand to longhand before parsing
    const normalized = this.normalize(recipe);
    this.parseSlotSpec(normalized, 'root', '');
    return this;
  }
  normalize(recipe: Recipe): Recipe {
    if (typeof recipe !== 'object') {
      throw Error('recipe must be an Object');
    }
    // TODO(sjmiles): would be great if `normalize` normalized all the things
    return recipe;
  }
  parseSlotSpec(spec: Recipe, slotName: string, parentName: string): void {
    // process entries
    for (const key in spec) {
      switch (key) {
        case '$meta':
          // value is a dictionary
          this.meta = {...this.meta, ...spec.$meta};
          break;
        case '$stores':
          // value is a StoreSpec
          this.parseStoresNode(spec.$stores);
          break;
        default: {
          // value is a ParticleSpec
          const container = parentName ? `${parentName}#${slotName}` : slotName;
          this.parseParticleSpec(container, key, spec[key]);
          break;
        }
      }
    }
  }
  parseStoresNode(stores: Dictionary<StoreSpec>) {
    for (const key in stores) {
      this.parseStoreSpec(key, stores[key]);
    }
  }
  parseStoreSpec(name: string, spec: StoreSpec) {
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
  parseParticleSpec(container: Container, id: ParticleId, spec: ParticleSpec) {
    if (!spec.$kind) {
      log.warn(`parseParticleSpec: malformed spec has no "kind":`, spec);
      throw Error();
    }
    if (this.particles.find(s => s.id === id)) {
      log('duplicate particle name');
      return;
    }
    this.particles.push({id, container, spec});
    if (spec.$slots) {
      this.parseSlotsNode(spec.$slots, id);
    }
  }
  parseSlotsNode(slots: Dictionary<SlotSpec>, parent: string): void {
    entries(slots).forEach(([key, spec]) => this.parseSlotSpec(spec, key, parent));
  }
}
