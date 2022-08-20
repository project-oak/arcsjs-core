/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../Dom/xen/xen-async.js';
import {subscribeToDefaultStream} from '../Media/media-stream/media-stream.js';
import {getHolistic} from './mp-classifier.js';

const {FACEMESH_TESSELATION} = globalThis;

const template = Xen.Template.html`

<style>
  :host {
    display: block;
    position: relative;
    pointer-events: none;
  }
  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  canvas {
    max-width: 100%;
    display: block;
    position: relative;
    left: 0;
    top: 0;
  }
  /* [selfie] {
    transform: scale(-1, 1);
  }
  [flip] {
    transform: scaleX(-1);
  } */
</style>

<video autoplay playsinline muted></video>
<canvas></canvas>
`;

export class MpHolistic extends Xen.Async {
  static get observedAttributes() {
    return [];
  }
  get template() {
    return template;
  }
  _didMount() {
    this.video = this._dom.$('video');
    this.canvas = this._dom.$('canvas');
    this.canvasCtx = this.canvas.getContext('2d');
  }
  getInitialState() {
    const subscriber = stream => this.state = {stream};
    const stream = subscribeToDefaultStream(subscriber);
    return {stream};
  }
  update({}, state) {
    if (state.stream !== this.video.srcObject) {
      this.video.srcObject = state.stream;
    }
    if (!state.classifier) {
      state.classifier = getHolistic();
      state.classifier.onResults(this.onResults.bind(this));
    }
    if (state.classifier && state.stream && !state.perceiving) {
      state.perceiving = true;
      requestAnimationFrame(() => this.perceive(state.classifier, this.video));
    }
  }
  perceive(classifier, video) {
    if (this.video.videoWidth && this.video.videoHeight) {
      classifier.send({image: video});
    } else {
      this.state = {perceiving: false};
    }
  }
  onResults(results) {
    this.state = {perceiving: false};
    //
    const {video, canvas} = this;
    const ctx = this.canvasCtx;
    //
    canvas.width = this.clientWidth;
    canvas.height = video.videoHeight / video.videoWidth * this.clientWidth;
    //
    ctx.save();
    //
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    //
    const {drawConnectors: lines, drawLandmarks: marks} = globalThis;
    //
    //lines(ctx, results.poseLandmarks,      POSE_CONNECTIONS,     {color: '#00FF00', lineWidth: 2});
    //marks(ctx, results.poseLandmarks,      {color: '#FF0000', lineWidth: 1});
    //
    lines(ctx, results.faceLandmarks,      FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
    //
    //lines(ctx, results.leftHandLandmarks,  HAND_CONNECTIONS,     {color: '#CC0000', lineWidth: 2});
    marks(ctx, results.leftHandLandmarks,  {color: '#00FF00', lineWidth: 1});
    //
    //lines(ctx, results.rightHandLandmarks, HAND_CONNECTIONS,     {color: '#00CC00', lineWidth: 2});
    marks(ctx, results.rightHandLandmarks, {color: '#FF0000', lineWidth: 1});
    //
    ctx.restore();
  }
}

customElements.define('mp-holistic', MpHolistic);