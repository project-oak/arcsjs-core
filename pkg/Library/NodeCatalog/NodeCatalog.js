/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
template: html`
<style>
  :host {
    height: 100%;
  }
  [container] {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
    user-select: none;
  }
  [frame="nodeList"] {
    width: 100%;
  }
</style>

<div frame="nodeSearch"></div>
<div container>
  <div frame="nodeList"></div>
</div>
`
});
