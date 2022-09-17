/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Holistic = {
  $meta: {
    description: 'Mediapipe Holistic',
    name: 'Holistic',
    group: 'model'
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      connection: true
    },
    output: {
      $type: 'Pojo'
    }
  },
  holistic: {
    $kind: 'Mediapipe/Holistic',
    $inputs: ['image'],
    $outputs: ['output']
  }
};
