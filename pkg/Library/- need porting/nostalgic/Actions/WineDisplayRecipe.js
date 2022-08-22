/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const WineDisplay = {
  $meta: {
    description: `Wine Display`,
    name: 'WineDisplay',
    group: 'vertical',
  },
  $stores: {
    imageRef: {
      $type: 'ImageRef'
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    },
    metadataResults: {
      $type: `JSON`
    }
  },
  WineDisplay: {
    $container: 'ClassifierScrim#details',
    $kind: 'Actions/WineDisplay',
    $bindings: {
      classifierResults: '',
      metadataResults: ''
    }
  }
};
