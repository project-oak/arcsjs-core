/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async initialize(inputs, state, {service}) {
  state.canvasOut = await service({kind: 'MediaService', msg: 'allocateCanvas', data: {width: 1280, height: 720}});
  state.compose = async data => service({kind: 'MediaService', msg: 'compose', data});
},
async update({imageA, imageB, operation}, {canvasOut, compose}) {
  if (imageA && imageB) {
    await compose({imageA: imageA.canvas, imageB: imageB.canvas, imageOut: canvasOut, operation});
    return {output: {canvas: canvasOut, version: Math.random()}};
  }
}
});
