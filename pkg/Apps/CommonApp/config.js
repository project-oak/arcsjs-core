/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
let url;
if (import.meta.url.includes('localhost')) {
  url = `http://localhost:9888/0.4.5`;
  url = `http://localhost/gob/arcsjs-core/pkg`;
} else {
  url = `https://arcsjs.web.app/0.4.5`;
}

globalThis.config = {
  arcsPath: url,
  aeon: 'pose/0.0.1',
  // theme: 'dark',
  logFlags: {
    app: true,
    //recipe: true,
    //arc: true,
    //code: true,
    particles: true,
    //storage: true,
    //surfaces: true,
    //services: true
  }
};
