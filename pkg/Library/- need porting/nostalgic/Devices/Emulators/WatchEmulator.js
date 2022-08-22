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
    --display-align-items: center;
    --display-text-align: center;
  }
  * {
    box-sizing: border-box;
  }
  [easel] {
    position: relative;
    background: url('../Library/RedOwl/assets/watchblack.png') no-repeat;
    background-size: contain;
    height: 300px;
    width: 300px;
    box-sizing: border-box;
  }
  [scrim] {
    background: url('../Library/RedOwl/assets/watchglare.png') no-repeat;
    background-size: contain;
    pointer-events: none;
  }
  [frame="screen"] {
    padding: 32px 36px;
    overflow: hidden;
  }
</style>

<div flex center rows>
  <div easel>
    <div trbl frame="screen" rows></div>
    <div trbl scrim></div>
  <div>
</div>

`});
