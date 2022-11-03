/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {utils} from '../Core/core.js';

let resources = {};

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
  },
  use(_resources) {
    resources = _resources;
  }
};

globalThis.Resources = Resources;
