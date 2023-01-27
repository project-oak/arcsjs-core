/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const OpenAiGpt3Node = {
  $meta: {
    id: 'OpenAiGpt3Node',
    displayName: 'OpenAi GPT-3',
    category: 'ML'
  },
  $stores: {
    context: {
      $type: 'Pojo',
      connection: true
    },
    prompt: {
      $type: 'Pojo',
      connection: true
    },
    result: {
      $type: 'Pojo'
    }
  },
  OpenAiGpt3: {
    $kind: '$library/OpenAi/OpenAiGpt3',
    $inputs: ['context', 'prompt', 'result'],
    $outputs: ['result']
  }
};