/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {CommonApp} from '../CommonApp/CommonApp.js';
import {quickStart} from '../CommonApp/arcs/arcs.js';

export const boot = (url, items, extraPaths) => {
  const LauncherApp = class extends CommonApp {
    constructor(paths) {
      super(paths);
      Object.assign(this, items);
    }
  };
  quickStart(LauncherApp, url, {
    $app: '$root/Apps/CommonApp',
    $config: '$app/config.js',
    ...extraPaths
  });
};