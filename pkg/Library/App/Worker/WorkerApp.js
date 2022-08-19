/**
* @license
* Copyright (c) 2022 Google LLC All rights reserved.
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file.
*/
import {Arcs} from './Arcs.js';

export const App = class {
  constructor(paths, root) {
    Arcs.init(root || document.body, paths.$engine);
    Arcs.addPaths(paths);
    Arcs.onservice = msg => console.log(msg);
  }
  spinup() {
    Arcs.addAssembly(this.userAssembly, 'user');
  }
  get Arcs() {
    return Arcs;
  }
};