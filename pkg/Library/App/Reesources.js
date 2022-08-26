/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const resources = {};

export const Resources = {
  new() {
    return Math.floor(Math.random()*1e3 + 9e2);
  },
  get(id) {
    return resources?.[id];
  },
  set(id, resource) {
    resources[id] = resource;
  },
  free(id) {
    this.set(id, null);
  }
};