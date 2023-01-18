/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const StaticText = {
  $meta: {
    id: 'StaticText',
    displayName: 'Static Text',
    category: 'Fields'
  },
  $stores: {
    text: {
      $type: 'String',
      $value: 'static text',
      connection: true
    },
    // textStyle: {
    //   $type: 'String',
    //   $value: 'font-weight: bold; color: red; font-size: 18px;',
    //   connection: true
    // }
  },
  text: {
    $kind: '$library/Fields/StaticText',
    $inputs: ['text']//, 'textStyle']
  }
};
