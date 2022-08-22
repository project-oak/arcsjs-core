/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
  template: html`
<style>
  :host {
    flex: 1;
    display: flex;
  }
  * {
    box-sizing: border-box;
  }
  [slot="screen"] {
    flex: 1;
    display: flex;
    border: 2px solid orange;
    border-bottom-left-radius: 36px;
    border-bottom-right-radius: 36px;
    overflow: hidden;
  }
</style>

<div slot="screen"></div>

`});
