/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import '../GraphAppSkeleton/config.js';
import {quickStart} from '../GraphAppSkeleton/arcs/arcs.js';
import {LauncherApp} from './LauncherApp.js';

quickStart(LauncherApp, import.meta.url, {
  $app: '$root/GraphAppSkeleton',
  $config: '$app/config.js'
});
