/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global chrome */
import './arcs/config.js';
import {Resources} from './arcs/arcs.js';

// get extreme powers
chrome.runtime.getBackgroundPage(bgPage => {
  //console.log(bgPage);
  const {app, Resources: bgResources} = bgPage;
  //console.log(app, bgResources);
  Resources.use(bgResources.all());
  app.arcs.setComposerRoot(document.body);
});
