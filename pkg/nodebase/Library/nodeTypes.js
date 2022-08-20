/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import * as FieldNodes from './FieldNodes/FieldNodes.js';

const {values} = Object;

export const nodeTypes = globalThis.nodeTypes = [...values(FieldNodes)];
