/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Chef} from '../../arcsjs-support.js';
import {Action, cloneRecipeForDevices} from '../RecipeBuilder/Action.js';
import {createHubModelRecipe} from './HubModelRecipes.js';
import {ClassifierScrimRecipe} from './ClassifierScrimRecipe.js';
import {BarDisplay} from './BarDisplayRecipe.js';
import {JSONDisplay} from './JSONDisplayRecipe.js';

const map = {
  'FinagleRecipe': finagleRecipe,
  'ActionForModel': createActionForModel,
  'ActionForClassifier': createActionForClassifier
};

export const RecipeService = async (runtime, host, request) => {
  const fn = map[request.msg];
  if (fn) {
    await fn(runtime, host, request.data);
    return true;
  }
};

const createActionForModel = (runtime, host, {model}) => {
  const recipe = createHubModelRecipe(model);
  Object.assign(recipe.$meta, {
    name: `Classify ${model.description}`,
    description: `Auto-generated classification of ${model.description}`
  });
  return createActionForClassifier(runtime, host, {
    recipe,
    displayRecipe: cloneRecipeForDevices(BarDisplay, 'wearables, watch, builder, phone')
  });
};

const createActionForClassifier = (runtime, host, {recipe, displayRecipe}) => {
  return Action.create({
    recipes: [
      recipe,
      cloneRecipeForDevices(ClassifierScrimRecipe, 'wearables, watch, builder, phone'),
      displayRecipe || cloneRecipeForDevices(JSONDisplay, 'wearables, watch, builder, phone')
    ],
    name: recipe.$meta.name,
    description: recipe.$meta.description,
    preview: './Library/RedOwl/assets/redowl.png',
    owner: runtime.uid,
    id: `${recipe.$meta.name}-${Math.floor(Math.random()*1000)}`
  });
};

const finagleRecipe = async (runtime, host, {recipe, value}) => {
  const task = value ? 'execute' : 'evacipate';
  return recipe && Chef[task](recipe, runtime, host.arc);
};