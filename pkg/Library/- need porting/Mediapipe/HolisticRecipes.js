/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const HolisticRecipe = {
  $meta: {
    description: 'Mediapipe: Holistic',
    name: 'Holistic',
    group: 'classifier'
  },
  $stores: {
  },
  Holistic: {
    $container: 'VideoFeed#overlay',
    $kind: 'Mediapipe/Holistic'
  }
};
