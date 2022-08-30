/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Chef, ParticleCook} from '../core.js';

export const RecipeService = async (runtime, host, request) => {
  switch (request.msg) {
    case 'FinagleRecipe':
      return finagleRecipe(runtime, host, request.data);
    case 'UpdateConnections': {
      return updateConnections(host, request.data);
    }
  }
};

const finagleRecipe = async (runtime, host, {recipe, value}) => {
  const task = value ? 'execute' : 'evacipate';
  return recipe && Chef[task](recipe, runtime, host.arc);
};

const updateConnections = (host, {particleId, spec}) => {
  return host.arc.updateParticleMeta(particleId, ParticleCook.specToMeta(spec));
};
