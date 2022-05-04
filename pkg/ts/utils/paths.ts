/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const PathMapper = class {
  map: Record<string, unknown>;
  constructor(root: string) {
    this.map = {};
    this.setRoot(root);
  }
  add(mappings) {
    Object.assign(this.map, mappings || {});
  }
  resolve(path) {
    const bits = path.split('/');
    const top = bits.shift();
    const prefix = this.map[top] || top;
    return [prefix, ...bits].join('/');
  }
  setRoot(root) {
    if (root.length && root[root.length-1] === '/') {
      root = root.slice(0, -1);
    }
    this.add({
      '$root': root,
      '$arcs': root
    });
  }
};

const root = import.meta.url.split('/').slice(0, -3).join('/');
export const Paths = globalThis['Paths'] = new PathMapper(root);
Paths.add(globalThis.config?.paths);
