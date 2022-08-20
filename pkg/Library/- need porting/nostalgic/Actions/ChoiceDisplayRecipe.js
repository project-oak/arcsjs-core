/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const ChoiceDisplayRecipe = {
  $meta: {
    description: `Choice Display`,
    name: 'ChoiceDisplay',
    group: 'basic',
    devices: 'phone, wearables, watch'
  },
  $stores: {
    transcript: {
      $type: 'Transcript'
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  ChoiceDisplay: {
    $container: 'main#screen',
    $kind: 'Actions/ChoiceDisplay',
    $bindings: {
      transcript: ''
    }
  }
};