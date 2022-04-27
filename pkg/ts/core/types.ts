/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export {Dictionary} from '../utils/types.js';

export type Tag = string;

export type StoreMeta = {
  arcid: string,
  name: string,
  type: string,
  owner: string,
  tags?: Tag[],
  value?: any,
  shareid?: string,
};

export type ParticleMeta = {
  kind: string,
  container: string
  staticInputs?;
  bindings?;
  inputs?: Array<String|Object>;
  outputs?: Array<String|Object>;
  // arbitrary field definitions
};

export type ArcMeta = {};
