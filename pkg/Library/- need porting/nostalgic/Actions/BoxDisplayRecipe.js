/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const BoxDisplay = {
  $meta: {
    description: `Box Display`,
    name: 'BoxDisplay',
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
  BoxDisplay: {
    $container: 'ClassifierScrim#details',
    $kind: 'Actions/BoxDisplay',
    $bindings: {
      boxes: 'classifierResults'
    }
  }
};
