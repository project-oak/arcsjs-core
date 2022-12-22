/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const SplitPanelNode = {
  $meta: {
    id: 'SplitPanelNode',
    displayName: 'Split Panel',
    category: 'Panels'
  },
  $stores: {
    layout: {
      $type: 'String',
      values: ['vertical', 'horizontal']
    },
    style: {
      $type: 'String'
    }
  },
  panel: {
    $kind: "Layout/SplitPanel",
    $inputs: ['layout', 'center', 'style'],
    $slots: {
      FirstContainer: {},
      SecondContainer: {}
    }
  }
};