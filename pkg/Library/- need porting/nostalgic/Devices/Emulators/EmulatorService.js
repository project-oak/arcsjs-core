/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Arc} from '../../../env/arcs/js/core/Arc.js';
import {makeId} from '../../../env/arcs/js/utils/id.js';
import {Services} from '../../App/services.js';
import {Surfaces} from '../../Dom/surfaces/xen/xen-surfaces.js';
import {Chef} from '../../../env/arcs/js/recipe/Chef.js';
import {PhoneEmulatorRecipe} from './PhoneEmulatorRecipe.js';
import {WatchEmulatorRecipe} from './WatchEmulatorRecipe.js';
import {WearableEmulatorRecipe} from './WearableEmulatorRecipe.js';
import {ArVrClientRecipe} from '../ArVrClientRecipe.js';

const deviceRecipes = [PhoneEmulatorRecipe, WatchEmulatorRecipe, WearableEmulatorRecipe, ArVrClientRecipe];

const recipeForDevice = name => deviceRecipes.find(({$meta}) => $meta.name.toLowerCase() === name);

export const EmulatorService = async (runtime, host, {msg, name}) => {
  switch (msg) {
    case 'request-surface': {
      const arc = await makeArcOnSurface(runtime);
      const recipe = recipeForDevice(name || 'watch');
      await Chef.execute(recipe, runtime, arc);
      return arc;
    }
  }
};

const makeArcOnSurface = async user => {
  const id = makeId(2, 2, 'x');
  const surface = await Surfaces.create(id, null, `./Library/Devices/Emulators/surface/surface.html`);
  return makeArc(user, id, {}, surface, Services.user);
};

const makeArc = async (user, name, meta, surface, service) => {
  // make an arc on `surface`
  const arc = new Arc(name, meta, surface);
  // install service handler
  user.installService(arc, service);
  // add `arc` to runtime
  await user.addArc(arc);
  // ready
  return arc;
};