/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {utils} from '../../arcsjs-support.js';

export const HubModelRecipe = {
  $meta: {
    description: `Image Classifier`,
    name: 'HubModel',
    group: 'classifier',
    devices: ['builder', 'phone', 'wearables']
  },
  $stores: {
    selectedHubModel: {
      $type: 'HubModel'
    },
    imageRef: {
      $type: 'ImageRef',
      $tags: ['shared']
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    },
    status: {
      $type: 'String'
    }
  },
  Classifier: {
    $kind: `Actions/HubModelClassifier`,
    $bindings: {
      imageRef: '',
      classifierResults: '',
      model: 'selectedHubModel',
      status: ''
    },
    $staticInputs: {
      //model
    }
  }
};

export const createHubModelRecipe = (selectedHubModel) => {
  const recipe = utils.deepCopy(HubModelRecipe);
  recipe.Classifier.$staticInputs['model'] = selectedHubModel;
  return recipe;
};
