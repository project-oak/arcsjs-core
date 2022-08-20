/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const WebPageDisplayRecipe = {
  $meta: {
    description: `Web Page Display`,
    name: `WebPageDisplay`,
    group: `basic`,
    devices: ['builder', 'phone', 'smartscreen']
  },
  $stores: {
    url: {
      $type: 'String',
      $tags: ['shared']
    },
  },
  WebPage: {
    $container: `main#screen`,
    $kind: 'Actions/WebPageDisplay',
    $bindings: {
      url: ''
    }
  }
};
