/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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

// const resources2 = {};

// export const Resources2 = {
//   get resources() {
//     return resources2;
//   },
//   newId() {
//     return utils.makeId(4, 4, '-');
//   },
//   get(id) {
//     return Resources2.resources[id];
//   },
//   set(id, resource) {
//     Resources2.resources[id] = {
//       res: resource,
//       version: Math.random()
//     };
//     return id;
//   },
//   free(id) {
//     Resources.set(id, null);
//   },
//   allocate(resource) {
//     return Resources.set(Resources.newId(), resource);
//   },
//   all() {
//     return Resources2.resources;
//   }
// };

// /*export*/ const ResourceService = {
//   allocateResource() {
//     const id = '';
//     return id;
//   },
//   disposeResource(id) {
//   },
//   allocateCanvas() {
//     const id = '';
//     return id;
//   }
// };