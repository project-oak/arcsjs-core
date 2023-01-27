/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 export const PrivateSendNode = {
  $meta: {
    id: 'PrivateSendNode',
    displayName: 'Send (Private)',
    category: 'Policy'
  },
  $stores: {
    recipient: {
      $type: 'String'
    },
    data: {
      $tags: ['private'],
      $type: 'Pojo',
      connection: true
    }
  },
  SendNode: {
    $kind: '$labs/Raksha/Send',
    $staticInputs: {
      private: true
    },
    $inputs: ['recipient', 'data'],
    $outputs: ['result']
  }
};

export const PublicSendNode = {
  $meta: {
    id: 'PublicSendNode',
    displayName: 'Send (Public)',
    category: 'Policy'
  },
  $stores: {
    recipient: {
      $type: 'String'
    },
    data: {
      $tags: ['public'],
      $type: 'Pojo',
      connection: true
    }
  },
  SendNode: {
    $kind: '$labs/Raksha/Send',
    $inputs: ['recipient', 'data'],
    $outputs: ['result']
  }
};