({
/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
template: html`
<style>
  :host {
    width: 240px;
    height: 240px;
    pointer-events: none;
  }
  mp-holistic {
    transform: scaleX(-1);
  }
</style>
<mp-holistic trbl center rows></mp-holistic>
`
});
