/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const ActionDriver = {
  $kind: 'Actions/ActionDriver',
  $bindings: {
    actionId: '',
    actionsDefault: '',
    actionsPrivate: '',
    actionsAggregate: ''
  }
};

export const ActionDriverRecipe = {
  $meta: {
    name: 'ActionDriverRecipe'
  },
  $stores: {
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  ActionDriver
};