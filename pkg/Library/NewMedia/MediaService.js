/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../Core/core.js';
import {Resources} from '../App/Resources.js';
import {subscribeToStream, unsubscribeFromStream} from '../Media/media-stream/media-stream.js';

const log = logFactory(logFactory.flags.services, 'MediaService', 'coral');

const {assign} = Object;
const dom = (tag, props, container) => (container ?? document.body).appendChild(assign(document.createElement(tag), props));
//  const isImproperSize = (width, height) => (width !== 1280 && width !== 640) || (height !== 480 && height !== 720);

export const MediaService = class {
  static async allocateResource(resource) {
    return Resources.allocate(resource);
  }
  static async allocateCanvas(size) {
    log('allocateCanvas');
    const {width, height} = size ?? {width: 240, height: 180};
    //const canvas = dom('canvas', {style: `display: none; width: ${width}px; height: ${height}px;`});
    const canvas = dom('canvas', {width, height});
    return Resources.allocate(canvas);
  }
  static async drawImage({source, target, dx, dy, dw, dh, operation}) {
    const realTarget = Resources.get(target);
    const realSource = Resources.get(source);
    if (realTarget && realSource) {
      let args = [dx ?? 0, dy ?? 0];
      if (dw && dh) {
        args = [...args, dw, dh];
      }
      // else {
      //   dw = realTarget.width = realSource.width;
      //   dh = realTarget.height = realSource.height;
      // }
      const ctx = realTarget.getContext('2d');
      ctx.globalCompositeOperation = operation ?? 'source-over';
      ctx.drawImage(realSource, ...args);
    }
  }
  static async allocateVideo() {
    const video = document.createElement('video');
    return Resources.allocate(video);
  }
  static async assignStream({video, stream}) {
    const [realVideo, realStream] = [Resources.get(video), Resources.get(stream)];
    if (realVideo) {
      const play = src => {
        realVideo.srcObject = src;
        if (src) {
          realVideo.play();
        }
      };
      if (realVideo._arcsStream !== stream) {
        unsubscribeFromStream(realVideo._arcsStream, realVideo._listener);
        realVideo._arcsStream = stream;
        realVideo._listener = () => {
          play(Resources.get(stream));
        }
        subscribeToStream(stream, realVideo._listener)
      }
      play(realStream);
    }
  }
  static async startFrameCapture(video) {
    this.captures ??= {};
    if (!this.captures[video]) {
      const realVideo = Resources.get(video.video);
      console.log('startFrameCapture: realVideo:', realVideo, video);
      if (realVideo) {
        this.captures[video] = startCapture(realVideo, video.fps);
      }
    }
    const capture = this.captures[video];
    return {frame: {canvas: capture.canvas}};
  }
  static async stopFrameCapture(video) {
    const capture = this.captures?.[video];
    if (capture) {
      this.captures[video].playing = false;
      this.captures[video] = null;
    }
  }
};

const startCapture = (video, fps) => {
  // create a canvas object
  const canvas = document.createElement('canvas');
  canvas.width = 1280; //CAMERA_WIDTH;
  canvas.height = 720; //CAMERA_HEIGHT;
  // tracking data
  const info = {
    canvas: Resources.allocate(canvas),
    playing: true
  };
  // frame time (ms)
  const ft = 1000 / fps;
  // intial time
  let t0;
  const frameCapture = (time) => {
    const ctx = canvas.getContext('2d');
    // stop if playing flag goes false
    if (info.playing) {
      // current delta
      let dt = 0;
      // do we have an intial time?
      if (t0) {
        // elapsed time is dt
        dt = time - t0;
        // if elapsed time is sufficient
        if (dt >= ft) {
          // capture the video pixels
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // capture the time overage
          dt -= ft;
          //console.log('overage', dt);
        }
      }
      // wait a frame from the last frame line (account for overage)
      t0 = time - dt;
      // go again
      requestAnimationFrame(frameCapture);
    }
  };
  // start animating
  requestAnimationFrame(frameCapture);
  // return tracking data
  return info;
};
