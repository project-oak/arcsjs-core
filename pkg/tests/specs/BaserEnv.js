/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import '../config.js';
import {Paths} from '../../arcsjs-support.js';
import {BaserApp} from '../../baser/BaserApp.js';

const surfaceRoot = window.workbench;

const BaserTestApp = class extends BaserApp {
  constructor() {
    super();
    this.surfaceRoot = surfaceRoot;
  }
};

export const AppClass = BaserTestApp;
