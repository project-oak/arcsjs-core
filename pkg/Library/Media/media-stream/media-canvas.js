/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/Xen/xen-async.js';
// import {subscribeToStream, unsubscribeFromStream} from './media-stream.js';

const template = Xen.Template.html`
<style>
  :host {
    /* display: none; */
  }
  canvas {
    border: 2px solid magenta;
  }
  video {
    display: none;
  }
</style>
<canvas></canvas>
<video autoplay playsinline></video>
`;

const getResource = (id) => globalThis.resources?.[id];
const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);

export class MediaCanvas extends Xen.Async {
  static get observedAttributes() {
    return ['frequency', 'stream'];
  }
  get template() {
    return template;
  }
  _didMount() {
    this.canvas = assign(this._dom.$('canvas'), {width: 640, height: 480});
    this.video = this._dom.$('video');
  }
  getInitialState() {
    return {
      id: Math.floor(Math.random()*1e3 + 9e2)
    };
  }
  update({frequency, stream}, state) {
    // state.id refers to our output canvas' resource id
    setResource(state.id, this.canvas);
    this.value = state.id;
    // 'stream' here is a stream resource id
    if (stream !== state.stream) {
      state.stream = stream;
      const realStream = getResource(stream);
      this.video.srcObject = realStream;
      // reset time
      this.t0 = Date.now();
    } else {
      // how long since last time
      const t = Date.now();
      const dt = t - this.t0;
      this.t0 = t;
      const msPerFrame = 1000 / frequency;
      if (dt > msPerFrame) {
      this.t0 += (dt - msPerFrame);
    }
    //
    this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    //
  // const stream = state.stream;
  // if (stream !== state.lastStream) {
  //   state.lastStream = stream;
  //   const videoStreamAvailable = stream && this.hasVideoTracks(stream);
  //   // notify about the stream sitch
  //   this.value = videoStreamAvailable;
  //   this.fire('stream');
  //   // enable rendering for stream update
  //   // shouldRender is set false in update
  //   // to squelch an extra render
  //   //state.shouldRender = videoStreamAvailable;
  // }
  //if (state.videoPlaying) {
  //  this.updateSnap({box, version}, state);
  //}
    }
  }
  // watchMediaStream(streamId) {
  //   if (this.lastStreamId) {
  //     unsubscribeFromStream(this.lastStreamId);
  //   }
  //   this.lastStreamId = streamId;
  //   this.value = false;
  //   this.fire('stream');
  //   // listen to media-stream and set it's data into state
  //   return subscribeToStream(streamId, realStream => {
  //     this.mergeState({realStream});
  //     this.notifyStream(realStream);
  //     this.invalidate();
  //     // if (!this.hasVideoTracks(stream)) {
  //     //   this.value = false;
  //     //   this.fire('stream');
  //     // }
  //   });
  // }
  // notifyStream(stream) {
  //   // notify about the stream sitch
  //   const videoStreamAvailable = stream && this.hasVideoTracks(stream);
  //   this.value = videoStreamAvailable;
  //   this.fire('stream');
  // }
  //shouldRender({}, {shouldRender}) {
  //  // allow state-based render squelch
  //  return shouldRender;
  //}
  render({flip, stream}, {}) {
    const realStream = getResource(stream);
    return {flip, realStream};
  }
  onVideoReady() {
    this.mergeState({videoReady: true});
    this.video.play();
  }
  onVideoPlaying() {
    this.mergeState({videoPlaying: true});
  }
  // async updateSnap({box, version}, state) {
  //   let snapping;
  //   if (version !== state.version) {
  //     snapping = true;
  //     state.version = version;
  //   }
  //   if (!snapping) {
  //     const jbox = JSON.stringify(box);
  //     if (state.jbox !== jbox) {
  //       state.jbox = jbox;
  //       snapping = true;
  //     }
  //   }
  //   if (snapping) {
  //     // rendering the video-element has some bad side-effect (maybe srcObject?)
  //     // avoiding extra renders minimizes flashing
  //     state.shouldRender = false;
  //     if (box && box.width && box.height) {
  //       // force the sync stack to unroll, we will respond via event
  //       await this.snapShot(box);
  //     }
  //   }
  // }
  // async snapShot(box) {
  //   const {canvas, video} = this;
  //   const {videoWidth: width, videoHeight: height} = video;
  //   //
  //   const w = box.width * width;
  //   const h = box.height * height;
  //   const l = width - box.xCenter * width - w / 2;
  //   const t = box.yCenter * height - h / 2;
  //   //
  //   // take the snapshot
  //   canvas.width = w;
  //   canvas.height = h;
  //   canvas.getContext('2d').drawImage(video, l, t, w, h, 0, 0, w, h);
  //   //
  //   // this.value = canvas.toDataURL();
  //   this.fire('snap');
  // }
  hasVideoTracks(stream) {
    return stream.getVideoTracks().some(track=>track.readyState !== 'ended');
  }
}
customElements.define('media-canvas', MediaCanvas);
