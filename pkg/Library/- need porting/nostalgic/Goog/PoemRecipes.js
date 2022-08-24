/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const HaikuPoemRecipe = {
  $meta: {
    description: 'Write a Haiku',
    name: 'HaikuPoem',
    devices: 'phone, wearables, watch'
  },
  poet: {
    $container: 'main#screen',
    $kind: `Goog/HaikuWriter`
  }
};