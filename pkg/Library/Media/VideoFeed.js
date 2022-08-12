({
/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
render({boxSelection: box}) {
  return {box};
},
onSnap({eventlet}) {
  return {imageRef: eventlet.value};
},
template: html`
<style>
  * {
    box-sizing: border-box;
  }
  [feed] {
    position: relative;
    border: 1px solid var(--theme-color-bg-1);
    background-color: black;
  }
  video-view {
    width: 100%;
    height: 100%;
  }
  [slot="overlay"] {
    position: absolute;
    inset: 0;
    background-color: transparent;
  }
  [box] {
    border: 3px dotted var(--theme-color-8);
  }
</style>

<div feed flex>
  <video-view flip box="{{box}}" on-snap="onSnap"></video-view>
  <div slot="overlay"></div>
</div>
`
});
