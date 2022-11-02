/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const turnkey = async (App, Paths) => {
  try {
    app = globalThis.app = new App(Paths.map);
    await app.spinup();
  } catch(x) {
    console.error(x);
  }
};

export const quickStart = (App, url, extraPaths) => {
  document.body.style.opacity = 0;
  configurePaths({url}, Library, Paths);
  Object.keys(extraPaths).forEach(key => {
    if (!Paths.map[key]) {
      Paths.map[key] = Paths.resolve(extraPaths[key]);
    }
  });
  turnkey(App, Paths);
  setTimeout(() => Object.assign(document.body.style, {opacity: 1, transition: 'opacity 300ms ease-out'}), 100);
};