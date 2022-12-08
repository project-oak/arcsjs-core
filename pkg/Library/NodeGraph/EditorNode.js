/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const EditorNode = {
  $meta: {
    id: 'EditorNode',
    displayName: 'Editor',
    category: 'Panels'
  },
  $stores: {
    graph: {
      $type: 'Pojo',
      connection: true
    }
  },
  panel: {
    $kind: 'NodeGraph/Editor',
    $inputs: ['graph'],
    $outputs: ['graph']
  }
};
