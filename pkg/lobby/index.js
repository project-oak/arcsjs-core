/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {app, canvas, Resources} from './lobby.js';

// build a return stream off of this canvas
const returnStream = canvas.captureStream(30);
const id = Resources.allocate(returnStream);
// tell webRTC this is our returnStream
app.arcs.set('user', 'returnStream', id);

// incoming streams
const streams = [];
// playback infrastructure
const videos = [];

// what to do when stream info is updated
const onStream = (key, info) => {
  // find a video playback element for this stream
  let video = videos[key];
  // make it if id doesn't exist
  if (!video) {
    // make an invisible playback element so we can access frames
    video = Object.assign(document.createElement('video'), {
      autoplay: true, playsinline: true, muted: true,
      style: 'width: 128px; height: 128px; position: absolute; visibility: hidden;'
    });
    document.body.appendChild(video);
    // memoize
    videos[key] = video;
  }
  // map our stream key to the resource info
  streams[key] = info;
  // get the realStream from Resources
  const realStream = Resources.get(info);
  // if it's new, attach it to the video object
  if (realStream !== video.srcObject) {
    video.srcObject = realStream;
  }
};

// watch for changes in four streams
app.arcs.watch('user', 'stream', info => onStream(1, info));
app.arcs.watch('user', 'stream2', info => onStream(2, info));
app.arcs.watch('user', 'stream3', info => onStream(3, info));
app.arcs.watch('user', 'stream4', info => onStream(4, info));

// compose stream frames into canvas for transmission back to clients
const draw = () => requestAnimationFrame(() => {
  const margin = 16;
  const {width, height} = canvas;
  const [wc, hc] = [width/2 - margin, height/2 - margin];
  const ctx = canvas.getContext('2d');
  let i = 0;
  for (const video of videos) {
    if (video) {
      const x = (i % 2) * (wc + margin);
      const y = Math.floor(i / 2) * (hc + margin);
      ctx.drawImage(video, x, y, wc, hc);
      i++;
    }
  }
  draw();
});

draw();