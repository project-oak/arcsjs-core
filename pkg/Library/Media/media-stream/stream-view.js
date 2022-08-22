/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/Xen/xen-async.js';
import {subscribeToStream, unsubscribeFromStream} from './media-stream.js';

const getResource = (id) => globalThis.resources?.[id];
const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);

export class StreamView extends Xen.Async {
  static get observedAttributes() {
    return ['flip', 'stream', 'frequency', 'version'];
  }
  _didMount() {
    this.canvas = Object.assign(this._dom.$('canvas'), {width: 640, height: 480});
    this.video = this._dom.$('video');
  }
  getInitialState() {
    return {
      subscriber: this.invalidate.bind(this),
      id: Math.floor(Math.random()*1e3 + 9e2)
    };
  }
  update({frequency, stream}, state) {
    // make output canvas available as a resource id
    setResource(state.id, this.canvas);
    this.value = state.id;
    // 'stream' here is a stream resource id
    if (stream !== state.stream) {
      unsubscribeFromStream(state.stream, state.subscriber);
      subscribeToStream(stream, state.subscriber);
      state.stream = stream;
      console.log(stream);
    } else if (stream && frequency) {
      this.doCanvasCadence(Number(frequency), stream);
    }
    if (stream) {
      const realStream = getResource(stream);
      if (state.realStream !== realStream) {
        state.realStream = realStream;
        this.video.srcObject = realStream;
      }
    }
  }
  doCanvasCadence(frequency, id) {
    const iv = this.invalidate.bind(this);
    const msPerFrame = 1000 * (1 / frequency) || 16;
    this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    setTimeout(iv, msPerFrame);
    this.fire('canvas', id);
    //return {
    //  image: {canvas: id, version: Math.random()}
    //};
  }
  render({flip, stream}, {}) {
    //const realStream = getResource(stream);
    return {flip}; //, realStream};
  }
  onVideoReady() {
    this.mergeState({videoReady: true});
    this.video.play();
  }
  onVideoPlaying() {
    this.mergeState({videoPlaying: true});
  }
  hasVideoTracks(stream) {
    return stream.getVideoTracks().some(track=>track.readyState !== 'ended');
  }
  get template() {
    return Xen.Template.html`
<style>
  :host {
    display: flex;
    min-width: 160px;
    min-height: 120px;
    font-size: 10px;
    color: black;
    background-color: black;
  }
  * {
    box-sizing: border-box;
  }
  video {
    width: 320px;
    height: 240px;
  }
  canvas {
    width: 320px;
    height: 240px;
  }
  [flip] {
    transform: scaleX(-1);
  }
</style>

<video autoplay playsinline muted flip$="{{flip}}"></video>
<canvas Xhidden></canvas>
    `;
  }
}
customElements.define('stream-view', StreamView);
