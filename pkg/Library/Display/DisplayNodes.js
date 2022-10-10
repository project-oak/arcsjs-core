/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export * from './BarDisplayNode.js';

export const JsonViewer =  {
  $meta: {
    id: 'JsonViewer',
    category: 'Output'
  },
  $stores: {
    json: {
      $type: 'Pojo',
      connection: true,
      noinspect: true
    },
  },
  jsonDisplay: {
    $kind: '$library/Display/JsonViewer',
    $inputs: [{classifierResults: 'json'}]
  }
};

export const OutputImage = {
  $meta: {
    id: 'OutputImage',
    category: 'Output'
  },
  $stores: {
    image: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
  },
  image: {
    $kind: '$library/Media/OutputImage',
    $inputs: ['image']
  }
};
