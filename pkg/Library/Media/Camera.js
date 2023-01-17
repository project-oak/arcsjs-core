/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
template: html`
<style>
  :host {
    color: var(--theme-color-fg-2);
    background-color: var(--theme-color-bg-2);
    overflow: hidden;
  }
  [capture] {
    height: 0;
    overflow: hidden;
    visibility: false;
  }
</style>
<!--
  Camera is a stream-view with bookends.
-->
<!-- device bookend -->
<div><slot name="device"></slot></div>
<!-- stream view -->
<stream-view flex stream="{{stream}}"></stream-view>
<!-- capture bookend -->
<div capture><slot name="capture"></slot></div>
`
});
