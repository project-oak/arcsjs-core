/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const PixiJsDemoNode = {
  $meta: {
    id: 'PixiJsDemo',
    displayName: 'PixiJs Multi Demo',
    category: 'PixiJs'
  },
  $stores: {
    demoName: {
      $type: 'String',
      values: ['Spiral', 'Shader', 'BlendMode', 'Transparent', 'Tinting', 'CacheAsBitmap', 'SpineBoy']
    }
  },
  pixi: {
    $kind: '$library/PixiJs/PixiJs',
    $inputs: [{demo: 'demoName'}]
  }
};