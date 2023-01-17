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
async update({imageA, imageB, imageC, imageD, opA, opB, opC, opD}, {canvasOut, compose}) {
  if (imageA) {
    const images = [imageA, imageB, imageC, imageD].map(i => i?.canvas);
    let lastOp;
    const operations = [opA, opB, opC, opD].map(o => o ? (lastOp = o) : lastOp);
    await compose({images, operations, imageOut: canvasOut});
    return {output: {canvas: canvasOut, version: Math.random()}};
  }
}
});
