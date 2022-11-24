/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 export const FlyoutNode = {
  $meta: {
    id: 'FlyoutNode',
    displayName: 'Flyout',
    category: 'Panels'
  },
  $stores: {
    show: {
      $type: 'Boolean'
    }
  },
  panel: {
    $kind: 'Layout/FlyOut',
    $inputs: ['show'],
    $outputs: ['show'],
    $slots: {
      flyout: {}
    }
  }
};