/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import '../CommonApp/config.js';
import {boot} from '../CommonApp/boot.js';
import {graph} from './graph.js';

boot(import.meta.url, {graph});
