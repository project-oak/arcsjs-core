/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const JSONataNode = {
  $meta: {
    id: 'JSONataNode',
    category: 'Tools'
  },
  $stores: {
    json: {
      $type: 'Pojo',
      connection: true
    },
    expression: {
      $type: 'MultilineText'
    },
    result: {
      $type: 'String',
      noinspect: true
    },
  },
  JSONata: {
    $kind: 'JSONata/JSONata',
    $inputs: ['json', 'expression'],
    $outputs: ['result']
  }
};

export const DataNode = {
  $meta: {
    id: 'DataNode',
    displayName: 'Data',
    category: 'Field'
  },
  $stores: {
    data: {
      $type: 'Pojo'
    }
  },
  text: {
    // TODO(sjmiles): works for now
    $kind: '$library/Fields/TextObject',
    $inputs: [{'text': 'data'}],
    $outputs: ['data']
  }
};

export const NodeTypes = {
  JSONataNode,
  DataNode
};
