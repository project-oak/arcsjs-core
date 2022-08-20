/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Chef} from '../../arcsjs-support.js';

// meta fields
//({name, description, preview, logo, owner, creationTime})

export const cloneRecipeForDevices = (recipe, devices) => ({...recipe, $meta: {...recipe?.$meta, devices: devices.split(',').map(d => d.trim())}});

export const Action = {
  create(meta) {
    const recipes = meta.recipes;
    delete meta.recipes;
    //
    meta.id = meta.id || meta.name.toLowerCase();
    meta.description = meta.description || meta.name;
    //
    const defaultMeta = {
      logo: './Library/RedOwl/assets/redowl.png',
      preview: './Library/RedOwl/assets/redowl.png',
      owner: 'redowl',
      creationTime: new Date(1634799600000).getTime()
    };
    //
    return {
      recipes,
      meta: {
        ...defaultMeta,
        ...meta
      }
    };
  },
  async execute(action, user, arc) {
    return this.enact('execute', action, user, arc);
  },
  async evacipate(action, user, arc) {
    return this.enact('evacipate', action, user, arc);
  },
  async enact(method, action, user, arc) {
    return action && Promise.all(action.recipes.map(recipe => Chef[method](recipe, user, arc)));
  }
};