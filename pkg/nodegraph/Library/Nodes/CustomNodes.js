/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Librarian = {
  $meta: {
    name: 'librarian',
    category: 'Custom'
  },
  $stores: {
    library: {
      $type: '[Particle]',
      // $tags: ['persisted']
    }
  },
  librarian: {
    $kind: '$app/../librarian/Library/Librarian.js',
    $inputs: ['library'],
    $outputs: ['library']
  }
};