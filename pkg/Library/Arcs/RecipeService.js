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
    case 'RemoveStore':
      return removeStore(request.data.storeId, runtime);
    case 'UpdateConnections': {
      const {particleId, spec} = request.data;
      return host.arc.updateParticleMeta(particleId, ParticleCook.specToMeta(spec));
    }
  }
};

const finagleRecipe = async (runtime, host, {recipe, value}) => {
  const task = value ? 'execute' : 'evacipate';
  return recipe && Chef[task](recipe, runtime, host.arc);
};

const removeStore = (storeId, runtime) => {
  runtime.removeStore(storeId);
  Object.values(runtime.arcs).forEach(arc => arc.removeStore(storeId));
  return true;
};
