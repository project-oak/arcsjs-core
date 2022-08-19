/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { logFactory } from '../utils/log.js';
const log = logFactory(logFactory.flags.recipe, 'flan', 'violet');
const { entries, create } = Object;
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
        const normalized = this.normalize(recipe);
        this.parseSlotSpec(normalized, 'root', '');
        return this;
    }
    normalize(recipe) {
        if (typeof recipe !== 'object') {
            throw Error('recipe must be an Object');
        }
        // TODO(sjmiles): would be great if `normalize` normalized all the things
        return recipe;
    }
    parseSlotSpec(spec, slotName, parentName) {
        // process entries
        for (const key in spec) {
            switch (key) {
                case '$meta':
                    // value is a dictionary
                    this.meta = { ...this.meta, ...spec.$meta };
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
        this.particles.push({ id, container, spec });
        if (spec.$slots) {
            this.parseSlotsNode(spec.$slots, id);
        }
    }
    parseSlotsNode(slots, parent) {
        entries(slots).forEach(([key, spec]) => this.parseSlotSpec(spec, key, parent));
    }
}
