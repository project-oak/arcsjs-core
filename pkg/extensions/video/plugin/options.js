/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global chrome */
import '../app/config.js';
import {Resources} from '../app/arcs.js';

// get extreme powers
chrome.runtime.getBackgroundPage(bgPage => {
  const {app, Resources: bgResources} = bgPage;
  // share resources with bgPage
  Resources.use(bgResources.all());
  // render here
  app.arcs.setComposerRoot(document.body);
});
