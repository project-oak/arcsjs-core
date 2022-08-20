/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {models} from '../Apps';
import {Action, cloneRecipeForDevices} from '../RecipeBuilder/Action.js';

import * as hub from './HubModelRecipes.js';
import * as food from './OpenFoodFactsRecipes.js';
import * as speech from './SpeechRecipes.js';
//import * as wisp from '../Wisp/WispRecipes.js';

import {BarDisplay} from './BarDisplayRecipe.js';
import {ClassifierScrimRecipe} from './ClassifierScrimRecipe.js';
import {TranslationDisplay} from './TranslationDisplayRecipe.js';
//import {WineDisplay} from './WineDisplayRecipe.js';

const findModelByDescription = (description) => {
  return models.find(m => m.description === description);
};

export const VivinoAction = Action.create({
  recipes: [
    hub.createHubModelRecipe(findModelByDescription('Common wine')),
    cloneRecipeForDevices(ClassifierScrimRecipe, 'watch, builder, phone', 'wearables'),
    //cloneRecipeForDevices(WineDisplay, 'watch, builder, phone', 'wearables'),
    //wisp.WispWineDisplayRecipe,
    // cloneRecipeForDevices(wispDisplays.WispWine, 'wearables'),
    // cloneRecipeForDevices(wispDisplays.WispClassifierScrimRecipe, 'wearables'),
  ],
  name: 'Vivino AR reviews',
  description: 'View wine reviews in AR',
  preview: './Library/RedOwl/assets/vivino.jpeg',
});

export const OpenFoodFactsAction = Action.create({
  recipes: [
    hub.createHubModelRecipe(findModelByDescription('Popular FR packaged goods (by SKU)')),
    food.OpenFoodFactsMetadataRecipe,
    cloneRecipeForDevices(ClassifierScrimRecipe, 'wearables, watch, builder, phone'),
    cloneRecipeForDevices(food.OpenFoodFactsDisplay, 'wearables, watch, builder, phone'),
  ],
  name: 'OpenFoodFacts AR nutriscore',
  description: 'View boxed food nutrition facts in AR.',
  preview: './Library/RedOwl/assets/off.png'
});

export const BeerAction = Action.create({
  recipes: [
    hub.createHubModelRecipe(findModelByDescription('Beer and cider bottles')),
    cloneRecipeForDevices(ClassifierScrimRecipe, 'wearables, watch, builder, phone'),
    cloneRecipeForDevices(BarDisplay, 'wearables, watch, builder, phone'),
  ],
  name: 'Beers',
  description: 'Beers and ciders bottles',
  preview: './Library/RedOwl/assets/beers.png'
});

export const TranslateAction = Action.create({
  recipes: [
    speech.Speech2TextRecipe,
    speech.TranslatorRecipe,
    cloneRecipeForDevices(TranslationDisplay, 'wearables, watch, builder, phone'),
  ],
  name: `Translator`,
  description: `(en -> es)`,
  preview: './Library/RedOwl/assets/en_to_es.png'
});
