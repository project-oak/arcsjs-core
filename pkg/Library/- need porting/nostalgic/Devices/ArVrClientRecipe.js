/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {ModelViewerRecipe} from '../ModelViewer/ModelViewerRecipes.js';

const {$container, ...ModelViewer} = ModelViewerRecipe.ModelViewer;
const CustomRecipe = {
  ...ModelViewerRecipe,
  ModelViewer
};

export const ArVrClientRecipe = {
  $meta: {
    description: 'Red Owl ArVr Client',
    name: 'ArVr'
  },
  main: {
    $kind: 'Devices/SmartScreen',
    $slots: {
      screen: CustomRecipe
    }
  }
};
