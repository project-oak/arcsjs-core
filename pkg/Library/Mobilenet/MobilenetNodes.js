/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const Mobilenet = {
  $meta: {
    name: 'mobilenet',
    category: 'Model',
  },
  $stores: {
    Image: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    Model: {
      $type: 'HubModel',
      $value: {
        url: './mobilenet.min.js',
        input: '3, 256, 256',
        output: '1024',
      }
    },
    ClassifierResults: {
      $type: '[ClassifierResults]',
      noinspect: true
    }
  },
  classifier: {
    $kind: '$library/Mobilenet/Classifier',
    $inputs: [
      {imageRef: 'Image'},
      {model: 'Model'},
    ],
    $outputs: [
      {classifierResults: 'ClassifierResults'}
    ]
  }
};
