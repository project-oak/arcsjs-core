/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global scope */
({
  async update({show}, state, {service}) {
    // if (show === true) {
    //   state.showTools = true;
    // }
  },
  render({show}, {showTools}) {
    return {
      showTools: show
    };
  },
  async onToggleFlyOverClick({show}, state, {service}) {
    return {show: false};
    //state.showTools = !state.showTools;
  },
  template: html`
<style>
  :host {
    position: absolute;
    flex: 0 !important;
  }
  /* beachball */
  /* [tools-button] {
    position: fixed;
    bottom: -15px;
    right: -15px;
    width: 32px;
    height: 32px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 1s ease-out;
    border-radius: 50%;
  }
  [tools-button]:hover {
    opacity: 1;
  }
  [tools-button] > img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  } */
  [scrim],[flyout] {
    z-index: 10000;
  }
  [scrim] {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #888888;
    opacity: 0.2;
    transform: translateX(120%);
  }
  [scrim][show] {
    transform: translateX(0);
  }
  [flyout] {
    position: fixed;
    transition: transform 200ms ease-in;
    box-shadow: #515151 0px 20px 30px -10px;
    color: #555;
    background: #333;
  }
  [right], [left] {
    top: 0;
    right: 0;
    bottom: 0;
    width: 50%;
    min-width: min(320px, 100vw);
    max-width: min(100vw, 800px);
    transform: translateX(120%);
  }
  [left] {
    transform: translateX(-120%);
  }
  [top], [bottom] {
    top: 0;
    right: 0;
    height: 50%;
    left: 0;
    transform: translateY(-120%);
    /*
    min-width: min(320px, 100vw);
    max-width: min(100vw, 800px);
    */
  }
  [bottom] {
    transform: translateY(120%);
  }
  [flyout][show] {
    transform: translateX(0) translateY(0);
  }
</style>

<!-- flyout button -->
<!-- <div tools-button on-click="onToggleFlyOverClick">
  <img src=${scope.resolve('$library/App/assets/rainbow-128-opt.gif')}>
</div> -->

<!-- flyout -->
<div scrim show$="{{showTools}}" on-click="onToggleFlyOverClick"></div>
<div top flyout flex rows show$="{{showTools}}" frame="flyout"></div>
`
});
