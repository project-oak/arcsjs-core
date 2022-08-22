/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {share} from '../App';
import {defaultActions} from '../Appjs';

export const actionStores = {
  ...share({name: 'actions', type: 'Action'}),
  actionId: {
    $type: 'String',
    $tags: ['shared']
  },
  actionsDefault: {
    $type: '[Action]',
    $value: Object.values(defaultActions)
  },
  classifierResults: {
    $type: '[ClassifierResults]'
  }
};

// share creates three stores for 'name'
//  private library
//    `${name}Private`
//  shared library
//    `${name}Shared`
//  all libraries
//    `${name}Aggregate`
