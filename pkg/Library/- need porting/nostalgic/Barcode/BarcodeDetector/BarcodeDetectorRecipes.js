/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const BarcodeDetector = {
  $meta: {
    description: 'Barcode Detector',
    name: 'BarcodeDetector',
    group: 'classifier',
    devices: ['builder', 'phone']
  },
  $stores: {
    imageRef: {
      $type: 'ImageRef'
    },
    barcodes: {
      $type: '[Barcode]'
    },
    status: {
      $type: 'String'
    }
  },
  barcodeDetector: {
    $kind: 'Barcode/BarcodeDetector/BarcodeDetector',
    $bindings: {
      imageRef: '',
      classifierResults: '',
      status: ''
    }
  }
};
