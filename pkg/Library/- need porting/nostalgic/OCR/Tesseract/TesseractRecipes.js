/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const Tesseract = {
  $meta: {
    description: 'OCR (Tesseract)',
    name: 'Tesseract',
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
  Tesseract: {
    $kind: 'OCR/Tesseract/TesseractClassifier',
    $bindings: {
      imageRef: '',
      classifierResults: '',
      status: ''
    }
  }
};

export const TesseractDisplay = {
  $meta: {
    description: `Tesseract Display`
  },
  $stores: {
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  Display: {
    $container: 'main#screen',
    // standard ux to placate the user
    // if the data is not ready
    $kind: 'Actions/ClassifierScrim',
    $bindings: {
      imageRef: '',
      classifierResults: ''
    },
    $slots: {
      details: {
        TextDisplay: {
          // for text results
          $kind: 'Actions/TextDisplay',
          $bindings: {
            classifierResults: ''
          }
        }
      }
    }
  }
};