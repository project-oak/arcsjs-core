/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Resources} from './arcs.js';

let resources = {};

Object.assign(Resources, {
  use(_resources) {
    resources = _resources;
  },
  get(id) {
    return resources[id];
  },
  set(id, resource) {
    resources[id] = resource;
    return id;
  },
  all() {
    return resources;
  }
});

export {Resources};