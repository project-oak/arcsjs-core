/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const languages = [
  {lang: 'en', country: 'united states'},
  {lang: 'es', country: 'spain'},
  {lang: 'fr', country: 'france'},
  {lang: 'it', country: 'italy'},
  {lang: 'de', country: 'germany'},
  {lang: 'pt', country: 'portugal'},
];

export const TranslationConfig = {
  $meta: {
    name: 'Translation Config',
    category: 'speech'
  },
  $stores: {
    translationConfig: {
      $type: 'TranslationConfig',
      $value: {
        inLang: 'en',
        outLang: 'es'
      }
    }
  },
  translateConfig: {
    // $container: 'main#screen',
    $kind: 'nostalgic/Actions/TranslationConfig',
    $inputs: [{config: 'translationConfig'}],
    $outputs: [{config: 'translationConfig'}],
    $staticInputs: {languages}
  }
};

export const TranslationDisplay = {
  $meta: {
    name: 'Translation Display',
    category: 'speech'
  },
  $stores: {
    translation: {
      $type: 'Translation',
      connection: true
    }
  },
  TranslationDisplay: {
    $kind: 'nostalgic/Actions/TranslationDisplay',
    $inputs: ['translation'],
    $staticInputs: {languages}
  }
};
