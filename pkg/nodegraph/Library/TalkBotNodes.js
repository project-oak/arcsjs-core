/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const chatStores = {
  inChat: {
    $type: 'Pojo',
    $value: [],
    connection: true
  },
  outChat: {
    $type: 'Pojo',
    $value: [],
    noinspect: true
  }
};

export const TalkBotModeratorNode = {
  $meta: {
    id: 'TalkBotModeratorNode',
    displayName: 'TalkBot Moderator',
    category: 'Fresh'
  },
  $stores: {
    ...chatStores,
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
    ...chatStores,
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

// export const ChatNode = {
//   $meta: {
//     id: 'Chat',
//     displayName: 'Chat',
//     category: 'Fresh'
//   },
//   $stores: {
//     max: {
//       $type: 'Number',
//       $value: 0
//     },
//     chat: {
//       $type: 'ChatMessages',
//       $value: [],
//       noinspect: true
//     },
//     lamdaChat: {
//       $type: 'ChatMessages',
//       $value: [],
//       noinspect: true
//     }
//   },
//   TalkBot: {
//     $kind: '$app/Library/TalkBot',
//     $staticInputs: {
//       name: 'Lamda'
//     },
//     $inputs: [
//       {inputChat: 'chat'},
//       'max'
//     ],
//     $outputs: [
//       {outputChat: 'lamdaChat'}
//     ]
//   },
//   TalkBot2: {
//     $kind: '$app/Library/TalkBot',
//     $staticInputs: {
//       name: 'GPT-3'
//     },
//     $inputs: [
//       {inputChat: 'lamdaChat'},
//       'max'
//     ],
//     $outputs: [
//       // feedback
//       {outputChat: 'chat'}
//     ]
//   }
// };
