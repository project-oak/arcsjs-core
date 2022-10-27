/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const dom = (tag, props) => document.body.appendChild(Object.assign(document.createElement(tag), props));

const flashGray = (ctx, frame) => {
  const {width, height} = ctx.canvas;
  ctx.fillStyle = ['#88888820', '#88888840', '#88888830'][frame];
  ctx.fillRect(40, 40, width - 120, height - 120);
};

export const getStream = async (stream) => {
  const video = dom('video');
  const cameraStream = stream ?? await navigator.mediaDevices.getUserMedia({video: {}});
  video.srcObject = cameraStream;
  await video.play();
  return animateCanvas(30, snapVideo.bind(this, video));
};

const snapVideo = (video, ctx, frame) => {
  //const {width, height} = ctx.canvas;
  ctx.drawImage(video, 0, 0, width, height);
  // flashGray(ctx, frame);
  // TODO(sjmiles): this works, but it's REALLY SLOW (!?)
  //ctx.scale(1, -1);
  //ctx.drawImage(video, 0, -height);
  //ctx.drawImage(video, 0, 0);
};

export const animateCanvas = async (fps, update) => {
  const canvas = dom('canvas', {width: 800, height: 600, style: 'position: absolute;'});
  const ctx = canvas.getContext('2d');
  const interval = Math.max(0, Math.round(1000 / fps));
  let frame = 0;
  setInterval(() => {
    frame = (frame + 1) % 3;
    update(ctx, frame);
  }, interval);
  return canvas.captureStream(fps);
}

// export const getStream2 = async () => {
//   const video = dom('video');
//   const cameraStream = await navigator.mediaDevices.getUserMedia({
//     video: {
//     }
//   });
//   video.srcObject = cameraStream;
//   await video.play();
//   const {width, height} = video;
//   const canvas = dom('canvas', {width, height, style: 'transform: scale(0, -1) !important;'});
//   const ctx = canvas.getContext('2d');
//   const snap = () => ctx.drawImage(video, 0, 0);
//   requestAnimationFrame(() => {
//     snap();
//     requestAnimationFrame(snap());
//   });
//   return canvas.captureStream(30);
// };
