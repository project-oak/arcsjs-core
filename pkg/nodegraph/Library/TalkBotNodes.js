/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const TalkBotModeratorNode = {
  $meta: {
    id: 'TalkBotModeratorNode',
    displayName: 'TalkBot Moderator',
    category: 'Fresh'
  },
  $stores: {
    inChat: {
      $type: 'Pojo',
      $value: [],
      connection: true
    },
    outChat: {
      $type: 'Pojo',
      $value: [],
      noinspect: true
    },
    feedbackChat: {
      $type: 'Pojo',
      $value: [],
      noinspect: true
    },
    max: {
      $type: 'Number',
      $value: 0
    }
  },
  ChatModerator: {
    $kind: '$app/Library/TalkbotModerator',
    $inputs: ['max', 'inChat'],
    $outputs: ['outChat', 'feedbackChat']
  }
};

export const TalkBotNode = {
  $meta: {
    id: 'TalkBot',
    displayName: 'TalkBot',
    category: 'Fresh'
  },
  $stores: {
    inChat: {
      $type: 'Pojo',
      $value: [],
      connection: true
    },
    outChat: {
      $type: 'Pojo',
      $value: [],
      noinspect: true
    },
    name: {
      $type: 'String',
      $value: 'TalkBox'
    },
  },
  TalkBot: {
    $kind: '$app/Library/TalkBot',
    $inputs: [
      'name',
      {inputChat: 'inChat'},
    ],
    $outputs: [
      {outputChat: 'outChat'}
    ]
  }
};

export const ChatDisplayNode = {
  $meta: {
    id: 'ChatDisplay',
    displayName: 'Chat Display',
    category: 'Fresh'
  },
  $stores: {
    chat: {
      $type: 'Pojo',
      $value: [],
      connection: true
    }
  },
  TalkBotDisplay: {
    $kind: '$app/Library/ChatDisplay',
    $inputs: ['chat']
  }
};
