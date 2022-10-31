/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export const GraphsRecipe = {
  $meta: {
    description: 'Arcs Graphs Recipe'
  },
  $stores: {
    prompt: {
      $type: 'String',
      $value: 'How many is 5 plus 8?'
    },
    graph: {
      $type: 'Pojo',
    },
    result: {
      $type: 'Pojo'
    }
  },
  graphs: {
    $kind: '$graphs/Graphs',
    $slots: {
      prompt: {
        promptInput: {
          $kind: '$library/Fields/TextField',
          $inputs: [{'value': 'prompt'}],
          $staticInputs: {
            label: 'Ask me anything:'
          },
          $outputs: [{'value': 'prompt'}]
        }
      },
      graph: {
        graphViewer: {
          $kind: '$library/Display/JsonViewer',
          $inputs: [{classifierResults: 'graph'}]
        }
      },
      result: {
        resultViewer: {
          $kind: '$library/Display/JsonViewer',
          $inputs: [{classifierResults: 'result'}]
        }
      }
    }
  },
  graphgenerator: {
    // $kind: '$library/Noop', // Replace with MacroRunner
    $kind: '$graphs/GraphMaker',
    $inputs: [{input: 'prompt'}],
    $staticInputs: {
      macroId: 'tbd'
    },
    $outputs: ['graph']
  },
  graphrunner: {
    $kind: '$graphs/GraphRunner',
    $inputs: ['graph'],
    $outputs: ['result']
  }
};