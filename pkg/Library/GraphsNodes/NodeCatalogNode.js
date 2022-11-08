/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {NodeCatalogRecipe} from '../NodeTypeCatalog/NodeCatalogRecipe.js';

export const NodeCatalogNode = {
  ...NodeCatalogRecipe,
  $meta: {
    id: 'NodeCatalogNode',
    category: 'Panels'
  }
};