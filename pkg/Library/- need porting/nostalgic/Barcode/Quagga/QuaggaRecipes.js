/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const Quagga = {
  $meta: {
    description: 'Barcodes (Quagga)',
    name: 'QuaggaClassifier',
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
  Quagga: {
    $kind: 'Barcode/Quagga/QuaggaClassifier',
    $bindings: {
      imageRef: '',
      classifierResults: '',
      status: ''
    }
  }
};

export const QuaggaDisplay = {
  $meta: {
    description: `Quagga Display`
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