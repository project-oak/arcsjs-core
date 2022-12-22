/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const OpenAiGpt3TextNode = {
  $meta: {
    id: 'OpenAiGpt3TextNode',
    displayName: 'OpenAi GPT-3 Text',
    category: 'ML'
  },
  $stores: {
    context: {
      $type: 'Pojo'
    },
    prompt: {
      $type: 'Pojo'
    },
    result: {
      $type: 'String',
      noinspect: true
    }
  },
  OpenAiGpt3: {
    $kind: '$library/OpenAi/OpenAiGpt3Text',
    $inputs: ['context', 'prompt', 'result'],
    $outputs: ['result']
  }
};
