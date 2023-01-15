/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './config.js';
import {quickStart} from './arcs/arcs.js';
import {CommonApp} from './CommonApp.js';

quickStart(CommonApp, import.meta.url);
