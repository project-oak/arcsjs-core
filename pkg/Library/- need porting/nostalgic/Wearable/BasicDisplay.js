/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
  template: html`
    <style>
      :host {
        flex: 0 !important;
        height: 0;
      }
      [slot="screen"] {
        position: absolute;
        top: 20px;
        right: 12px;
        /* 50% dpi vs wearables */
        width: 320px;
        height: 180px;
        /**/
        background-color: transparent;
        z-index: 50;
        display: flex;
        overflow: hidden;
        border-radius: 16px;
        box-sizing: border-box;
        background-color: #050505E0;
        box-shadow: var(--theme-color-5) 0px 7px 9px 0px;
      }
      [slot="screen"] > * {
        /* embiggen */
        zoom: 1.1;
      }
    </style>
    <div slot="screen"></div>
  `
  });