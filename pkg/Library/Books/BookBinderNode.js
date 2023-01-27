/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const BookBinderNode = {
  $meta: {
    id: 'BookBinderNode',
    displayName: 'Book Binder',
    category: 'Demo Book'
  },
  $stores: {
    text: {
      $type: 'String',
      connection: true,
      noinspect: true
    },
    // prompt: {
    //   $type: 'String',
    //   connection: true
    // },
    pages: {
      $type: '[Page]',
      $value: [],
      $tags: ['private'],
      noinspect: true
    },
    illustratedPages: {
      $type: '[Page]',
      connection: true
    },
    // texts: {
    //   $type: 'String',
    //   noinspect: true
    // },
    // verifiedPage: {
    //   $type: 'Page',
    //   connection: true,
    //   noinspect: true
    // },
    // finalizedPages: {
    //   $type: '[Page]',
    //   noinspect: true
    // }
  },
  BookBinder: {
    $kind: '$labs/Demo/BookBinder',
    $staticInputs: {
      numPages: 3
    },
    //$inputs: ['prompt', 'pages', 'verifiedPage', 'texts'],
    $inputs: ['illustratedPages', 'text'],
    $outputs: ['pages'],
    // $outputs: [
    //   'pages',
    //   'finalizedPages',
    //   'verifiedPage',
    //   'texts'
    // ],
  }
};
