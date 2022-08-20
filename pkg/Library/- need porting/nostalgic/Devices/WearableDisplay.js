/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
template: html`
<style>
  [frame="screen"] {
    flex: none !important;
    /* for our 'wearables app' this is 640/360 after zooming */
    /* width: 50vw;
    height: 50vh; */
    width: 320px;
    height: 180px;
    background-color: #111;
    color: #eee;
    box-sizing: border-box;
    zoom: 2.0;
  }
</style>
<div rows frame="screen"></div>
`
});
