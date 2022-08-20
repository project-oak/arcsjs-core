/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const JSONDisplay = {
  $meta: {
    description: `JSON Display`,
    name: 'JSONDisplay',
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
  JSONDisplay: {
    $container: 'ClassifierScrim#details',
    $kind: 'Actions/JSONDisplay',
    $bindings: {
      classifierResults: ''
    }
  }
};