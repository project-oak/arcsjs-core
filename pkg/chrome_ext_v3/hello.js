/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './app/config.js';
import {quickStart} from './app/arcs.js';
import {ExtensionApp} from './app/ExtensionApp.js';

await quickStart(ExtensionApp, import.meta.url, {
  $nodegraph: '$app/deploy/nodegraph/Library'
});
