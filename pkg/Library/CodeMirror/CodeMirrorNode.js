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
      $type: 'String',
      connection: true
    },
    textOut: {
      $type: 'String',
      noinspect: true
    }
  },
  text: {
    $kind: '$library/CodeMirror/CodeMirror',
    $inputs: ['text'],
    $outputs: [{text: 'textOut'}]
  }
};
