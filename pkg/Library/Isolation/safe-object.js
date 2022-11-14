/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const {assign, keys, entries, values, create} = Object;

export const SafeObject = {
  create,
  assign,
  keys(o) {
    return o ? keys(o) : [];
  },
  values(o) {
    return o ? values(o) : [];
  },
  entries(o) {
    return o ? entries(o) : [];
  },
  mapBy(a, keyGetter) {
    return a ? values(a).reduce((map, item) => (map[keyGetter(item)] = item, map), {}) : {};
  },
  map(o, visitor) {
    return SafeObject.entries(o).map(([key, value]) => visitor(key, value));
  }
};