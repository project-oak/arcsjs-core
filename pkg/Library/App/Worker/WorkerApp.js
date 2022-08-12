/**
* @license
* Copyright (c) 2022 Google LLC All rights reserved.
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file.
*/
import {Arcs} from './Arcs.js';
import {loadCss} from '../../Dom/dom.js';
import {DevToolsRecipe} from '../../DevTools/DevToolsRecipe.js';

// App operates in the cloud city above the "Arcs" worker
// use "Arcs" object to communicate with worker

export const App = class {
  constructor(paths, root) {
    Arcs.init(root || document.body, paths.$engine);
    Arcs.addPaths(paths);
    Arcs.onservice = msg => console.log(msg);
  }
  async spinup() {
    await loadCss('../Library/Dom/Material/material-icon-font/icons.css');
    Arcs.addAssembly([...this.userAssembly, DevToolsRecipe], 'user');
  }
  enableMedia() {
    import('../../Media/Dom/media-stream/media-stream.js');
  }
  get Arcs() {
    return Arcs;
  }
};