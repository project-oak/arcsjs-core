/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const CompositeOperationValues = [
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
];

export const ImageCompositeNode = {
  $meta: {
    // should be 'name'
    id: 'ImageCompositeNode',
    displayName: 'Image Composite',
    category: 'Media'
  },
  $stores: {
    opA: {
      $type: 'CompositeOperation',
      values: CompositeOperationValues
    },
    opB: {
      $type: 'CompositeOperation',
      values: CompositeOperationValues
    },
    opC: {
      $type: 'CompositeOperation',
      values: CompositeOperationValues
    },
    opD: {
      $type: 'CompositeOperation',
      values: CompositeOperationValues
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
    imageC: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    },
    imageD: {
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
    $inputs: ['imageA', 'imageB', 'imageC', 'imageD', 'opA', 'opB', 'opC', 'opD'],
    $outputs: ['output']
  }
};
