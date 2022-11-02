/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const {keys} = Object;
const json = v => JSON.stringify(v);
const pretty = v => JSON.stringify(v, null, '  ');

export const stateCapture = () => {
  const {user} = globalThis.App;
  const data = keys(user.stores).reduce((data, key) => {
    const omit = [
      // these are kinda big
      'nodeTypes',
      'graphs',
      'myItems',
      // personal
      'favoriteItems',
      // depends on rendering
      'mobilenet1ClassifierResults'
    ].includes(key);
    if (!omit) {
      //console.warn(key);
      const {meta, data: value} = user.stores[key];
      data[key] = {meta, value};
    }
    return data;
  }, {});
  //console.warn('state', data);
  return json(data);
};