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
  [container] > * {
    width: 100%;
  }
</style>

<slot name="nodeSearch"></slot>
<div container>
  <slot name="nodeList"></slot>
</div>
`
});
