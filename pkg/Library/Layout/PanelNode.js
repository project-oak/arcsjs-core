/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const PanelNode = {
  $meta: {
    id: 'PanelNode',
    displayName: 'Panel',
    category: 'Panels'
  },
  $stores: {
    cssStyle: {
      $type: 'CssStyle'
    },
    style: {
      $type: 'String'
    },
    layout: {
      $type: 'String',
      values: ['row', 'column']
    },
    center: {
      $type: 'Boolean'
    }
  },
  panel: {
    $kind: "Layout/Panel",
    $inputs: ['layout', 'center', 'style', 'cssStyle'],
    $slots: {
      Container: {
      }
    }
  }
};