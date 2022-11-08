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
    Data: {
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
        text: ['Data:data']
      }
    },
    JSONata: {
      type: 'JSONataNode',
      props: {
        expression: "first & ', ' & last"
        //expression: 'first'
      },
      connections: {
        json: ['Data:data'],
      }
    },
    ExpressionDisplay: {
      type: 'DisplayNode',
      connections: {
        text: ['JSONata:expression']
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
