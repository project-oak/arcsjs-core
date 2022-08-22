/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {ClassifierScrimRecipe} from '../Actions/ClassifierScrimRecipe.js';
import {WebPageDisplayRecipe} from '../Actions/WebPageDisplayRecipe.js';
import * as plants from './PlantsRecipes.js';
import {Action, cloneRecipeForDevices} from '../RecipeBuilder/Action.js';

export const PlantAction = Action.create({
  recipes: [
    plants.FindPlantInfoRecipe,
    plants.PlantQuery,
    plants.IsPoisonous,
    cloneRecipeForDevices(ClassifierScrimRecipe, 'phone,wearables,watch'),
    cloneRecipeForDevices(plants.PlantInfoDisplay, 'phone,wearables,watch'),
    WebPageDisplayRecipe,
    plants.PlantWarning
  ],
  name: 'Plant recognizer',
  description: 'Recognize plants',
  preview: './Library/Goog/leaf.png'
});
