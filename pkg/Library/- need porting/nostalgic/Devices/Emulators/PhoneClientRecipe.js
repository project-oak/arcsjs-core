/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const SpeechToWikiRecipe = {
  $stores: {
    transcript: {
      $type: 'Transcript'
    },
    url: {
      $type: 'String',
      $tags: ['shared']
    }
  },
  s2w: {
    $kind: 'Devices/SpeechToWikiUrl',
    $bindings: {
      transcript: '',
      url: ''
    }
  },
  WebPage: {
    $kind: 'Actions/WebPageDisplay',
    $bindings: {
      url: ''
    }
  }
};

export const PhoneClientRecipe = {
  $meta: {
    description: 'Red Owl Phone Client'
  },
  main: {
    $kind: 'Devices/PhoneClient',
    $slots: {
      screen: SpeechToWikiRecipe
    }
  }
};
