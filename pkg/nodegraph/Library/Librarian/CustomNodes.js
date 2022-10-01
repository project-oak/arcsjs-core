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
    id: 'librarian',
    category: 'Custom'
  },
  $stores: {
    particle: {
      $type: '[Particle]',
      // TODO(mariakleiner): if not inspected, changing in Designer/Runner doesn't affect the pipeline!
      // noinspect: true
      //
    },
    nodeKey: {
      $type: 'String',
      noinspect: true,
      nodisplay: true,
      value: 'node.key'
    },  
  },
  customParticle: {
    $kind: '$app/Library/Librarian/CustomParticle',
    $inputs: ['particle', 'nodeKey'],
    $outputs: ['particle']
  }
};
