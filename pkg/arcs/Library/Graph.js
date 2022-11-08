/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export const Graph = {
  nodes: {
    Input: {
      type: 'DataNode',
      props: {
        data: [
          {first: "Don", last: "Quixote"},
          {first: "Sancho", last: "Panza"}
        ]
      }
    },
    InputDisplay: {
      type: 'DisplayNode',
      connections: {
        text: ['Input:data']
      }
    },
    Expression: {
      type: 'DataNode',
      props: {
        data: 'first & "," & last'
      }
    },
    ExpressionDisplay: {
      type: 'DisplayNode',
      connections: {
        text: ['Expression:data']
      }
    },
    JSONata: {
      type: 'JSONataNode',
      connections: {
        json: ['Input:data'],
        expression: ['Expression:data'],
      }
    },
    ResultDisplay: {
      type: 'DisplayNode',
      connections: {
        text: ['JSONata:result']
      }
    }
  }
};
