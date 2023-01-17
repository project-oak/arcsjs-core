/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../Dom/Xen/xen-async.js';
import {subscribeToStream} from './media-stream.js';

const template = Xen.Template.html`
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
    width: 100%;
    height: 100%;
  }
  [flip] {
    transform: scaleX(-1);
  }
</style>

<video playsinline muted flip$="{{flip}}" srcObject="{{srcObject:stream}}" on-canplay="onVideoReady" on-playing="onVideoPlaying"></video>
<canvas hidden></canvas>

`;

const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);

export class VideoView extends Xen.Async {
  static get observedAttributes() {
    return ['box', 'flip', 'version'];
  }
  get template() {
    return template;
  }
  _didMount() {
    this.canvas = this._dom.$('canvas');
    this.video = this._dom.$('video');
  }
  getInitialState() {
    return {
      id: Math.floor(Math.random()*1e3 + 9e2),
      stream: this.getMediaStream('default')
    };
  }
  getMediaStream(streamId) {
    // listen to media-stream and set it's data into state
    return subscribeToStream(streamId, stream => {
      this.mergeState({stream});
      if (!this.hasVideoTracks(stream)) {
        this.value = false;
        this.fire('stream');
      }
    });
  }
  update({box, version}, state) {
    setResource(state.id, this.canvas);
    this.value = state.id;
    if (state.lastStream !== state.stream) {
      state.lastStream = state.stream;
      const videoStreamAvailable = state.stream && this.hasVideoTracks(state.stream);
      this.value = videoStreamAvailable;
      // notify about the stream sitch
      this.fire('stream');
      // enable rendering for stream update
      // shouldRender is set false in update
      // to squelch an extra render
      state.shouldRender = videoStreamAvailable;
    }
    if (state.videoPlaying) {
      this.updateSnap({box, version}, state);
    }
  }
  shouldRender({}, {shouldRender}) {
    // allow state-based render squelch
    return shouldRender;
  }
  render({flip}, {stream}) {
    return {flip, stream};
  }
  onVideoReady() {
    this.mergeState({videoReady: true});
    this.video.play();
  }
  onVideoPlaying() {
    this.mergeState({videoPlaying: true});
  }
  async updateSnap({box, version}, state) {
    let snapping;
    if (version !== state.version) {
      snapping = true;
      state.version = version;
    }
    if (!snapping) {
      const jbox = JSON.stringify(box);
      if (state.jbox !== jbox) {
        state.jbox = jbox;
        snapping = true;
      }
    }
    if (snapping) {
      // rendering the video-element has some bad side-effect (maybe srcObject?)
      // avoiding extra renders minimizes flashing
      state.shouldRender = false;
      if (box && box.width && box.height) {
        // force the sync stack to unroll, we will respond via event
        await this.snapShot(box);
      }
    }
  }
  async snapShot(box) {
    const {canvas, video} = this;
    const {videoWidth: width, videoHeight: height} = video;
    //
    const w = box.width * width;
    const h = box.height * height;
    const l = width - box.xCenter * width - w / 2;
    const t = box.yCenter * height - h / 2;
    //
    // take the snapshot
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, l, t, w, h, 0, 0, w, h);
    //
    // this.value = canvas.toDataURL();
    this.fire('snap');
  }
  hasVideoTracks(stream) {
    return stream.getVideoTracks().some(track=>track.readyState !== 'ended');
  }
}
customElements.define('video-view', VideoView);
