/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 import {Resources} from '../arcs/index.js';

const dom = (tag, props) => document.body.appendChild(Object.assign(document.createElement(tag), props));

export const animateCanvas = async (fps, update) => {
  let frame = 0;
  const interval = Math.max(0, Math.round(1000 / fps));
  setInterval(() => {
    frame = (frame + 1) % 3;
    update(frame);
  }, interval);
}

const flashGray = (ctx, frame) => {
  const {width, height} = ctx.canvas;
  ctx.fillStyle = ['#88888820', '#88888840', '#88888830'][frame];
  ctx.fillRect(20, 20, width - 20, height - 20);
};

const snapVideo = (video, ctx, frame) => {
  const {width, height} = ctx.canvas;
  ctx.drawImage(video, 0, 0, width, height);
  // TODO(sjmiles): this works, but it's REALLY SLOW (!?)
  //ctx.scale(1, -1);
  //ctx.drawImage(video, 0, -height);
  //ctx.drawImage(video, 0, 0);
};

// for debugging
globalThis.Resources = Resources;

const imageInputStore = `camera1:input`;
const canvasOutputStore = `deviceimage1:output`;

// export const arcsProcessImage = async (inputCanvasId, outputCtx, frame) => {
//   //console.log('get device output canvas');
//   app.arcs.set('user', imageInputStore, {canvas: inputCanvasId, version: Math.random()});
//   // //
//   // const imageRef = await app.arcs.get('user', canvasOutputStore);
//   // const arcsCanvas = Resources.get(imageRef?.canvas);
//   // //
//   // if (arcsCanvas && outputCtx) {
//   //   outputCtx.drawImage(arcsCanvas, 0, 0);
//   // }
// };

export const getArcsCameraStream = async (stream) => {
  const video = dom('video');
  video.srcObject = stream ?? await navigator.mediaDevices.getUserMedia({video: {}});
  await video.play();
  //
  const inCanvas = dom('canvas', {width: 1280, height: 720, style: 'position: absolute;'});
  const inCtx = inCanvas.getContext('2d');
  const inputCanvasId = globalThis.Resources.allocate(inCanvas);
  //
  const outCanvas = dom('canvas', {width: 1280, height: 720, style: 'position: absolute;'});
  const outCtx = outCanvas.getContext('2d');
  //
  const fps = 30;
  //
  let arcsResultCanvas;
  //
  const update = (frame) => {
    snapVideo(video, inCtx);
    app.arcs.set('user', imageInputStore, {canvas: inputCanvasId, version: Math.random()});
    if (inCanvas) {
      outCtx.drawImage(inCanvas, 0, 0);
    }
    if (arcsResultCanvas) {
      outCtx.drawImage(arcsResultCanvas, 0, 0);
    } else {
      (async () => {
        const imageRef = await app.arcs.get('user', canvasOutputStore);
        arcsResultCanvas = Resources.get(imageRef?.canvas);
      })();
    }
    //flashGray(outCtx, frame);
  };
  animateCanvas(fps, update);
  //
  return outCanvas.captureStream(fps);
};
