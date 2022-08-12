/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// xen standard library? material-xen-components?

const {customElements: ce} = window;
const define = ce.define.bind(ce);

import {MxcTabBar} from './mxc-tab-bar.js';
define('mxc-tab-bar', MxcTabBar);

import {PageGroup} from './page-group.js';
define('page-group', PageGroup);

import {MxcTabPages} from './mxc-tab-pages.js';
define('mxc-tab-pages', MxcTabPages);

// import {ModalView} from './modal-view.js';
// define('modal-view', ModalView);

// import {FancyImage} from './fancy-image.js';
// define('fancy-image', FancyImage);

import {ImageUpload} from './image-upload.js';
define('image-upload', ImageUpload);
