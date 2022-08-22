/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const ZXing = {
  $meta: {
    description: 'Barcodes (ZXing)',
    name: 'ZXingClassifier',
    group: 'classifier',
    devices: ['builder', 'phone']
  },
  $stores: {
    imageRef: {
      $type: 'ImageRef'
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    },
    status: {
      $type: 'String'
    }
  },
  ZXing: {
    $kind: 'Barcode/ZXing/ZXingClassifier',
    $bindings: {
      imageRef: '',
      classifierResults: '',
      status: ''
    }
  }
};

export const ZXingDisplay = {
  $meta: {
    description: `ZXing Display`
  },
  $stores: {
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  Display: {
    $container: 'main#screen',
    $kind: 'Actions/JSONDisplay',
    $bindings: {
      imageRef: '',
      classifierResults: ''
    }
  }
};