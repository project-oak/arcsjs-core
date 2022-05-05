/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {logFactory} from '../utils/log.js';
import {Arc} from '../core/Arc.js';
import {Runtime} from '../Runtime.js';
import {Parser} from './RecipeParser.js';
import {StoreCook} from './StoreCook.js';
import {ParticleCook} from './ParticleCook.js';
import {Recipe} from './types.js';

const log = logFactory(logFactory.flags.recipe, 'Chef', '#087f23');

export class Chef {
  static async execute(recipe: Recipe, runtime: Runtime, arc: Arc) {
    if (arc instanceof Promise) {
      log.error('`arc` must be an Arc, not a Promise. Make sure `boostrapArc` is awaited.');
      return;
    }
    //log.groupCollapsed('executing recipe...', recipe.$meta);
    log('|-->...| executing recipe: ', recipe.$meta);
    const plan = new Parser(recipe);
    // `store` preparation
    await StoreCook.execute(runtime, arc, plan.stores);
    // `particle` preparation
    await ParticleCook.execute(runtime, arc, plan.particles);
    // seasoning
    // TODO(sjmiles): what do we use this for?
    arc.meta = {...arc.meta, ...plan.meta};
    log('|...-->| recipe complete: ', recipe.$meta);
    //log.groupEnd();
  }
  static async evacipate(recipe: Recipe, runtime: Runtime, arc: Arc) {
    //log.groupCollapsed('evacipating recipe...', recipe.$meta);
    log('|-->...| evacipating recipe: ', recipe.$meta);
    // TODO(sjmiles): this is work we already did
    const plan = new Parser(recipe);
    // `store` work
    // TODO(sjmiles): not sure what stores are unique to this plan
    //await StoreCook.evacipate(runtime, arc, plan);
    // `particle` work
    await ParticleCook.evacipate(runtime, arc, plan.particles);
    // seasoning
    // TODO(sjmiles): doh
    //arc.meta = {...arc.meta, ...plan.meta};
    log('|...-->| recipe evacipated: ', recipe.$meta);
    //log.groupEnd();
  }
  static executeAll(recipes: Recipe[], runtime: Runtime, arc: Arc) {
    return Promise.all(recipes?.map(recipe => this.execute(recipe, runtime, arc)));
  }
  static evacipateAll(recipes: Recipe[], runtime: Runtime, arc: Arc) {
    return Promise.all(recipes?.map(recipe => this.evacipate(recipe, runtime, arc)));
  }
}
