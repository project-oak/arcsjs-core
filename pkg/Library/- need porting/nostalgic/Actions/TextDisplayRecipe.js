/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const TextDisplay = {
  $meta: {
    description: `Text Display`,
    name: 'TextDisplay',
    group: 'basic'
  },
  $stores: {
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  TextDisplay: {
    $container: 'main#screen',
    $kind: 'Actions/TextDisplay',
    $bindings: {
      classifierResults: ''
    }
  }
};
