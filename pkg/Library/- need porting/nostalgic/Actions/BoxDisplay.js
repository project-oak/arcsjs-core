/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({boxes}) {
  log(boxes);
  return {
    boxes: this.renderBoxes(boxes)
  };
},

renderBoxes(boxes) {
  const [iw, ih] = [320, 240];
  const [cx, cy] = [0, 0]; //iw/2, ih/2];
  const scalar = 200 / ih;
  return boxes?.map(({classes, boundingBox: {height, originX, originY, width}}) => {
    const [l, t, w, h] =
      [originX+cx, originY+cy, width, height]
      .map(v => v*scalar)
      ;
    const p = classes[0]?.probability;
    return {
      style: {
        top: `${t}px`,
        left: `${l}px`,
        width: `${w}px`,
        height: `${h}px`,
        opacity: `${p}`,
        border: `${Math.floor(p*5)}px solid violet`
      }
    };
  });
},

template: html`
<style>
  :host {
    display: block;
    position: relative;
  }
  [box] {
    position: absolute;
    border: 1px solid magenta;
  }
</style>

<div repeat="box_t">{{boxes}}</div>

<template box_t>
  <div box xen:style="{{style}}"></div>
</template>
`
});
