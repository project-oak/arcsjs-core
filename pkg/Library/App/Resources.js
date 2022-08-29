/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {utils} from '../core.js';

const resources = {};

export const Resources = {
  newId() {
    return utils.makeId(4, 4, '-');
  },
  get(id) {
    return resources[id];
  },
  set(id, resource) {
    resources[id] = resource;
    return id;
  },
  free(id) {
    Resources.set(id, null);
  },
  allocate(resource) {
    return Resources.set(Resources.newId(), resource);
  },
  all() {
    return resources;
  }
};