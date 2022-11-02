/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ChatNode = {
  $meta: {
    id: 'Chat',
    displayName: 'Chat',
    category: 'Fresh'
  },
  $stores: {
    chat: {
      $type: '[String]',
      $value: [],
      noinspect: true
    },
    max: {
      $type: 'Number',
      $value: 0
    }
  },
  TalkBot: {
    $kind: '$app/Library/TalkBot',
    $inputs: [
      {input: 'chat'},
      'max'
    ],
    $outputs: [
      // feedback
      {output: 'chat'}
    ]
  },
  TalkBotDisplay: {
    $kind: '$app/Library/TalkBotDisplay',
    $inputs: [
      {input: 'chat'}
    ]
  }
};
