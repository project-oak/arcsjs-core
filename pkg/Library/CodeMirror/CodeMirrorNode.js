/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 export const CodeMirrorNode = {
  $meta: {
    id: 'CodeMirrorNode',
    displayName: 'CodeMirror',
    category: 'Fields'
  },
  $stores: {
    text: {
      $type: 'MultilineText',
      $tags: ['persisted']
    }
  },
  text: {
    $kind: '$library/CodeMirror/CodeMirror',
    $inputs: ['text'],
    $outputs: ['text']
  }
};
