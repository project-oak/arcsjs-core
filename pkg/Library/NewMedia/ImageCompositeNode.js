/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ImageCompositeNodeType = {
  $meta: {
    // should be 'name'
    id: 'ImageCompositeNode',
    displayName: 'Image Composite',
    category: 'Media'
  },
  $stores: {
    operation: {
      $type: 'CompositeOperation',
      values: [
        'source-over',
        'source-in',
        'source-out',
        'source-atop',
        'destination-over',
        'destination-in',
        'destination-out',
        'destination-atop',
        'lighter',
        'copy',
        'xor',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
        'luminosity'
      ]
    },
    images: {
      $type: '[Image]',
      connection: true,
      multiple: true,
    },
    imageA: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    imageB: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    output: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  ImageComposite: {
    $kind: '$library/NewMedia/ImageComposite',
    $inputs: ['imageA', 'imageB', 'operation'],
    $outputs: ['output']
  }
};
