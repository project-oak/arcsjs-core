/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import * as effectNodes from './EffectNodes/EffectNodes.js';

const {values} = Object;

export const nodeTypes = [
  ...values(effectNodes)
];

globalThis.nodeTypes = nodeTypes;
