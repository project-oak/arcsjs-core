/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const src = `${globalThis.config?.arcsPath}/Apps/Anywhere/arcs.mjs`;
console.log('arcs is here', src);

document.head.appendChild(Object.assign(document.createElement('script'), {type: 'module', src}));

globalThis.ArcsPromise = new Promise(resolve => {
  const waitFor = () => {
    if (globalThis.ArcsAnywhere?.quickStart) {
      resolve(globalThis.ArcsAnywhere);
    } else {
      //console.log('waiting...');
      setTimeout(waitFor, 1000);
    }
  };
  waitFor();
});
