/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Resources} from '../arcs/index.js';

// for debugging
globalThis.Resources = Resources;

const imageInputStore = `camera1:input`;
const canvasOutputStore = `deviceimage1:output`;

export const arcsProcessImage = async (inputCanvasId, outputCtx, frame) => {
  //console.log('get device output canvas');
  app.arcs.set('user', imageInputStore, {canvas: inputCanvasId, version: Math.random()});
  //
  const imageRef = await app.arcs.get('user', canvasOutputStore);
  const arcsCanvas = Resources.get(imageRef?.canvas);
  //
  if (arcsCanvas && outputCtx) {
    outputCtx.drawImage(arcsCanvas, 0, 0);
  }
};

// export const getArcsCameraStream = async () => new Promise(resolve => {
//   console.log('wait for arc spin up');
//   setTimeout(() => {
//     console.log('setting mediaDeviceState');
//     app.arcs.set('user', 'mediaDeviceState', {isCameraEnabled: true, isMicEnabled: false, isAudioEnabled: false});
//     console.log('wait for media spin up');
//     setTimeout(async () => {
//       console.log('get device output canvas');
//       const imageRef = await app.arcs.get('user', canvasOutputStore);
//       const canvas = Resources.get(imageRef.canvas);
//       const stream = canvas.captureStream(30);
//       console.log(imageRef, stream);
//       // console.log('get stream data');
//       // const streamId = await app.arcs.get('user', 'stream');
//       // const stream = Resources.get(streamId);
//       // console.log(streamId, stream);
//       // resolve with stream
//       resolve(stream);
//     }, 5000)
//   }, 2000);
// });