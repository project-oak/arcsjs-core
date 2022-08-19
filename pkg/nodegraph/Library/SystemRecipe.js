/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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
