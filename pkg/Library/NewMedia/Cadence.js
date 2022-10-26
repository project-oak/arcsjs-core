/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({image, fps}) {
  const frameMs = Math.abs(Math.floor(1000 / (fps || 30)));
  setInterval(() => {
    return {frame: {...image, version: Math.random()}};
  }, frameMs);
}
});
