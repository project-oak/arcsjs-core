/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const ClassifierScrimRecipe = {
  $meta: {
    description: 'Classifier Status',
    name: 'ClassifierScrimRecipe',
    group: 'basic',
    devices: ['builder', 'phone']
  },
  $stores: {
    status: {
    $type: 'String'
    },
    imageRef: {
    $type: 'ImageRef',
    $tags: ['shared']
    },
    classifierResults: {
    $type: '[ClassifierResults]'
    }
  },
  ClassifierScrim: {
    $container: 'main#screen',
    $kind: 'Actions/ClassifierScrim',
    $bindings: {
    status: '',
    imageRef: '',
    classifierResults: ''
    },
    $slots: {details: {}}
  }
  // $slots: {
  //   ClassifierScrim: {}
  // }
};
