/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
//import {Surface} from './conf/support.js';
import {StudioApp} from './StudioApp.js';

// const SpecialStudio = class extends StudioApp {
//   createSurface() {
//     return new SpecialSurface(document.body, true);
//   }
// };

// export const SpecialSurface = class extends Surface {
//   createContainer(name, container) {
//     return container;
//   }
//   createSubSurface(node, options) {
//     const subSurface = new SpecialSurface(node, !(options?.noShadowRoot));
//     subSurface.service = req => this.service(req);
//     return subSurface;
//   }
// };

// StudioApp could be extended here for environment-specific needs
// await (globalThis.App = new SpecialStudio()).spinup();

try {
  const app = new StudioApp({
    $arcs: './arcs.js',
    $library: '../Library',
    $app: '.'
  });
  await app.spinup();
} catch(x) {
  console.error(x);
}