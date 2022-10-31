/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './config.js';
import {ExtApp} from './ExtApp.js';
import {quickStart} from './arcs.js';

await quickStart(ExtApp, import.meta.url);
