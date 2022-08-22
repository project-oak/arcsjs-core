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
    position: relative;
  }
  * {
    box-sizing: border-box;
  }
  [slot="screen"] {
    overflow: hidden;
    padding: 36px;
  }
  [scrim] {
    border-bottom-left-radius: 36px;
    border-bottom-right-radius: 36px;
    overflow: hidden;
    background: url('./Library/RedOwl/assets/droid.svg') no-repeat cover;
  }
</style>

<div trbl slot="screen" rows></div>
<div trbl scrim></div>

`});
