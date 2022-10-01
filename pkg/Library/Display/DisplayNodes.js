/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const BarViewer =  {
  $meta: {
    id: 'bar viewer',
    category: 'Output'
  },
  $stores: {
    ClassifierResults: {
      $type: '[ClassifierResults]',
      connection: true,
      noinspect: true,
    },
  },
  jsonDisplay: {
    $kind: '$library/Display/BarDisplay',
    $inputs: [
      {classifierResults: 'ClassifierResults'}
    ]
  }
};

export const JsonViewer =  {
  $meta: {
    id: 'json viewer',
    category: 'Output'
  },
  $stores: {
    ClassifierResults: {
      $type: '[ClassifierResults]',
      connection: true,
      noinspect: true
    },
  },
  jsonDisplay: {
    $kind: '$library/Display/JsonViewer',
    $inputs: [{classifierResults: 'ClassifierResults'}]
  }
};

export const OutputImage = {
  $meta: {
    id: 'image viewer',
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
