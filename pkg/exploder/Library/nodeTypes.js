/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import * as effectNodes from './EffectNodes/EffectNodes.js';

const {values} = Object;

export const nodeTypes = [
  ...values(effectNodes)
];

globalThis.nodeTypes = nodeTypes;
