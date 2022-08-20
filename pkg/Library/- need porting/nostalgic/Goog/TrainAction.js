/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {WebPageDisplayRecipe} from '../Actions/WebPageDisplayRecipe.js';
import * as trains from './TrainRecipes.js';
import {Action} from '../RecipeBuilder/Action.js';

export const TrainAction = Action.create({
  recipes: [
    trains.FindTrainTicketsRecipe,
    trains.TrainTicketsDisplayRecipe,
    WebPageDisplayRecipe,
    trains.TrainTicketsQueryRecipe
  ],
  name: 'Train Tickets',
  description: 'Find train tickets',
  preview: './Library/RedOwl/assets/train.png'
});
