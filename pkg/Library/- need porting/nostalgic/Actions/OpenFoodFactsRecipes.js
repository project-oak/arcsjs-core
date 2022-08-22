/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const OpenFoodFactsMetadataRecipe = {
  $meta: {
    description: 'OpenFoodFacts Barcode Lookup',
    name: 'OpenFoodFacts',
    group: 'meta'
  },
  $stores: {
    classifierResults: {
      $type: '[ClassifierResults]'
    },
    metadataResults: {
      $type: 'JSON'
    }
  },
  OpenFoodFactsMetadata: {
    $kind: 'Actions/OpenFoodFactsMetadata',
    $bindings: {
      classifierResults: '',
      metadataResults: ''
    }
  }
};

export const OpenFoodFactsDisplay = {
  $meta: {
    description: `OpenFoodFacts Display`,
    name: 'OpenFoodFactsDisplay',
    group: 'vertical'
  },
  $stores: {
    imageRef: {
      $type: 'ImageRef'
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    },
    metadataResults: {
      $type: `JSON`
    }
  },
  OFFDisplay: {
    $container: 'ClassifierScrim#details',
    $kind: 'Actions/OpenFoodFactsDisplay',
    $bindings: {
      imageRef: '',
      classifierResults: '',
      metadataResults: ''
    }
  }
};
