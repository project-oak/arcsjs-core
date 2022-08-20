/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const BarDisplay = {
  $meta: {
    description: `Bar Display`,
    name: 'BarDisplay',
    group: 'basic'
  },
  $stores: {
    status: {
      $type: 'String'
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  BarDisplay: {
    $container: 'ClassifierScrim#details',
    $kind: 'App/BarDisplay',
    $bindings: {
      classifierResults: ''
    }
  }
};
