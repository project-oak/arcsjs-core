/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../Dom/Xen/xen-async.js';
import {Resources} from '../App/Resources.js';

const template = Xen.Template.html`
<style>
  :host {
    display: flex;
    flex-direction: column;
  }
  audio, canvas {
    width: 100%;
  }
  canvas {
    outline: 1px dotted silver;
    height: 100%;
  }
  [pad] {
    padding: 4px 4px 0px;
  }
  [flex] {
    flex: 1;
    overflow: hidden;
  }
</style>
<div pad>
  <audio crossOrigin="anonymous" controls on-play="onInteract"></audio>
</div>
<div flex>
  <canvas width="1024" height="256"></canvas>
</div>
`;

export class SimpleAudio extends Xen.Async {
  static get observedAttributes() {
    return ['src'];
  }
  get template() {
    return template;
  }
  _didMount() {
    this.audio = this._dom.$('audio');
    this.canvas = this._dom.$('canvas');
  }
  update({src}, state) {
    if (!state.streamId) {
      state.streamId = Resources.allocate();
    }
    if (state.src !== src) {
      state.src = src;
      this.audio.src = src;
    }
  }
  onInteract(e) {
    if (!this.state.context) {
      this.state.context = this.createAudioContext(this.state);
    }
  }
  createAudioContext(state) {
    const context = new AudioContext();
    const source = context.createMediaElementSource(this.audio);
    //
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const buffer = new Uint8Array(bufferLength);
    source.connect(analyser);
    //
    analyser.connect(context.destination);
    //
    Resources.set(state.streamId, {
      context,
      analyser,
      bufferLength
    });
    console.warn(state.streamId, context);
    //
    this.draw(analyser, buffer, bufferLength);
    //
    this.key = state.streamId;
    this.fire('stream');
    return context;
  }
  draw(analyser, buffer, length) {
    const drawAgain = requestAnimationFrame(() => this.draw(analyser, buffer, length));
    analyser.getByteTimeDomainData(buffer);
    const {width, height} = this.canvas;
    const ctx = this.canvas.getContext('2d');
    //ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    const sliceWidth = width * 1.0 / length;
    let x = 0;
    for (let i = 0; i < length; i++) {
      const v = buffer[i] / 128.0;
      const y = v * height/2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(width, height/2);
    ctx.stroke();
  }
}

customElements.define('simple-audio', SimpleAudio);
