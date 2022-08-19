/**
* @license
* Copyright (c) 2022 Google LLC All rights reserved.
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file.
*/

// video processing

export const inputVideo = document.createElement('video');
//inputVideo.style.display = 'none';
inputVideo.style = 'width: 160px; display: none;';
inputVideo.playsInline = true;
inputVideo.autoplay = true;
document.body.appendChild(inputVideo);
//
export const canvas = document.createElement('canvas');
canvas.style = 'display: none;';
document.body.appendChild(canvas);
//
export const postFx = canvas.captureStream();
// export const outputVideo = document.createElement('video');
// outputVideo.style = 'position: absolute; right: 4px; top: 4px; width: 160px;';
// outputVideo.playsInline = true;
// //outputVideo.autoplay = true;
// document.body.appendChild(outputVideo);
// outputVideo.srcObject = postFx;

const color = Math.random(Number.MAX_SAFE_INTEGER);

setInterval(() => {
  if (inputVideo.srcObject) {
    //inputVideo.play();
    const {videoWidth: w, videoHeight: h} = inputVideo;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(inputVideo, 0, 0);
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = color; //'crimson';
    ctx.fillText(`Eat at Joe's`, Math.random()*400, Math.random()*460);
  }
}, 16);
