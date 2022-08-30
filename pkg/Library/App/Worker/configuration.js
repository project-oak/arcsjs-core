/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const defaultConfig = {
  aeon: 'blueSky/00x00',
  //network: false,
  //firebase: false,
  logFlags: {
    //ergo: true,
    //arc: true,
    //dataset: true,
    particles: true,
    //composer: true,
    //render: true,
    network: true,
    discovery: true,
    //hub: true,
    //net: true,
    //history: true,
    //planner: true,
    //storage: true,
    surfaces: true
  }
};

// get global stuff
const {paths, config: preConfig} = globalThis;
export const config = {
  ...defaultConfig,
  paths: {
    // ...defaultPathConfig,
    ...paths
  },
  ...preConfig
};
globalThis.config = config;

// feed the configuration objects into the global scope
// library package `discover` uses `globalThis.aeon`
// `logFactory` uses `globalThis.logFlags`
// `globalThis.params` is available for general use
// TODO(sjmiles): was bad idea, make go away
Object.assign(globalThis, config);
config.logFlags && console.log(globalThis.config);
