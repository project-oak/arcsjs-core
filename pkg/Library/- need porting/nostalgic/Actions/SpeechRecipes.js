/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

 export const SpeechRecognizer = {
  $meta: {
    name: 'Speech Recognizer',
    category: 'speech'
  },
  $stores: {
    isMicEnabled: {
      $type: 'Boolean'
    },
    transcript: {
      $type: 'Transcript',
      $tags: ['shared']
    },
  },
  speechFeed: {
    $kind: 'Media/SpeechRecognizer',
    $inputs: ['isMicEnabled'],
    $outputs: ['transcript', 'isMicEnabled'],
  },
};

export const Speech2TextRecipe = {
  $meta: {
    name: 'Speech-To-Text',
    // devices: ['builder', 'phone']
    category: 'speech'
  },
  $stores: {
    transcript: {
     $type: 'Transcript',
     connection: true
    },
    text: {
      $type: 'String'
    },
  },
  SpeechToText: {
    $kind: 'nostalgic/Actions/SpeechToText',
    $inputs: ['transcript'],
    $outputs: ['text']
  }
};

export const TranslatorRecipe = {
  $meta: {
    name: 'Translate',
    category: 'speech'
  },
  $stores: {
    text: {
      $type: 'String',
      connection: true
    },
    translationConfig: {
      $type: 'TranslationConfig',
      connection: true
    },
    translation: {
      $type: 'Translation'
    }
  },
  Translator: {
    $kind: 'nostalgic/Actions/Translator',
    $inputs: ['text', 'translationConfig'],
    $outputs: ['translation'],
    // $staticInputs: {
    //   // TODO(mariakleiner): make recipe's settings UI.
    //   translationConfig: {inLang: 'en', outLang: 'es'},
    // }
  }
};

export const WikiSearchRecipe = {
  $meta: {
    name: 'Search in Wikipedia',
    // devices: ['builder', 'phone']
    category: 'speech'
  },
  $stores: {
    url: {
      $type: 'String',
      $tags: ['shared']
    },
    text: {
      $type: 'String'
    },
  },
  search: {
    $kind: 'nostalgic/Goog/SearchForThing',
    $inputs: [{query: 'text'}],
    $outputs: ['url'],
    $staticInputs: {
      searchUrl: 'https://en.wikipedia.org/wiki/'
    }
  }
};
