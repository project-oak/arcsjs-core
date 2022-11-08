/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './config.js';
import {Paths, quickStart} from './arcs.js';
import {SkeletonApp} from '../SkeletonApp.js';

quickStart(SkeletonApp, import.meta.url, {
  // because we put index.js in a sub-folder
  $app: Paths.resolve('$app/..'),
  $library: `$app/../Library`,
  // because we put config.js in a sub-folder
  $config: `$app/config/config.js`
});
