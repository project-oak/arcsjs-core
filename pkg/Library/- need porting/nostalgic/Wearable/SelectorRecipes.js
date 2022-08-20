/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const VideoSelectorRecipe = {
  $meta: {
    name: 'VideoSelectorRecipe',
    description: 'Mouse Selector',
    group: 'environment'
  },
  $stores: {
    boxSelection: {
      $type: 'Box'
    }
  },
  selector: {
    $container: 'VideoFeed#overlay',
    $kind: 'Media/BoxSelector',
    $outputs: ['boxSelection']
  }
};
