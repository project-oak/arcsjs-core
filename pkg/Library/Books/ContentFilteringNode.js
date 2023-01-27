/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const ContentFilteringNode = {
  $meta: {
    id: 'ContentFilteringNode',
    displayName: 'Content filtering',
    category: 'Demo Book'
  },
  $stores: {
    text: {
      $type: 'String',
      connection: true
    },
    image: {
      $type: 'Image',
      connection: true
    },
    filteredOutFrames: {
      $type: '[Frame]',
      $value: [],
      noinspect: true
    },
    verifiedFrame: {
      $type: 'Frame',
      noinspect: true
    },
    context: {
      $type: 'PersonalContext',
      $value: {
        denylist: ['spider', 'vampire']
      },
      nodisplay: true
    }
  },
  ContentFiltering: {
    $kind: '$labs/Demo/ContentFiltering',
    $inputs: [
      'text',
      'image',
      'filteredOutFrames',
      'context'
    ],
    $outputs: [
      'filteredOutFrames',
      'verifiedFrame'
    ],
    $events: {'onClick': ['needs_filter', 'public']}
  }
};