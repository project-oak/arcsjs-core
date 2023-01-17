/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const MaterialTabPagesNode = {
  $meta: {
    id: 'MaterialTabPagesNode',
    displayName: 'Material TabPages',
    category: 'Panels'
  },
  $stores: {
    tabs: {
      $type: 'String'
    }
  },
  panel: {
    $kind: "Layout/MaterialTabPages",
    $inputs: ['tabs'],
    $slots: {
      PagesContainer: {}
    }
  }
};