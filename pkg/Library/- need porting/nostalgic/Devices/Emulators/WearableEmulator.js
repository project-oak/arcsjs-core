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
      background: rgb(2,0,36);
      background: linear-gradient(33deg, rgba(2,0,36,1) 0%, rgba(110,110,110,1) 35%, rgba(71,71,71,1) 100%);
    }
    [slot="screen"] {
      width: 320px;
      height: 180px;
      background-color: black;
      border: 1px solid gray;
    }
  </style>

  <div flex center rows>
    <div rows slot="screen"></div>
  </div>
`
});
