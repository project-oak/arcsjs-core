/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {CommonApp} from './CommonApp.js';
import {quickStart} from './arcs/arcs.js';

export const boot = async (url, items, extraPaths) => {
  const LauncherApp = class extends CommonApp {
    constructor(paths) {
      super(paths);
      Object.assign(this, items);
    }
  };
  return quickStart(LauncherApp, url, {
    $config: '$app/config.js',
    ...extraPaths
  });
};