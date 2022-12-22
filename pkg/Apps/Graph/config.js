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
  aeon: 'graph/0.4.4',
  //theme: 'dark',
  logFlags: {
    app: true,
    //recipe: true,
    //arc: true,
    particles: true,
    //storage: true,
    //composer: true,
    services: true
  }
};
