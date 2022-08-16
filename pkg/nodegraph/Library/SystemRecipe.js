/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const SystemRecipe = {
  // $-fields are keywords, otherwise field names are identifiers
  $meta: {
    description: 'Node Graph Tool'
  },
  $stores: {
    profile: {
      $type: 'JSON'
    }
  },
  // describes a particle whose id is "systemHome"
  systemHome: {
    // implementation to use for this particle
    $kind: '../nodegraph/Library/System',
    $inputs: ['profile']
  },
  DevTools: {
    $kind: '../Library/DevTools/DevTools'
  }
};
