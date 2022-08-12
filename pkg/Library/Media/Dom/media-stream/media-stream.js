/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../../Dom/xen/xen-async.js';
import {logFactory} from '../../../core.js';

let sharedStream;
const subscribers = [];

export const subscribeToStream = fn => {
  subscribers.push(fn);
  return sharedStream;
};

const notifySubscribers = () => {
  subscribers.forEach(fn => fn(sharedStream));
};

const log = logFactory(logFactory.flags.media, 'media-stream', '#837006');

export class MediaStream extends Xen.Async {
  static get observedAttributes() {
    return ['playingvideo', 'playingaudio'];
  }
  async update(inputs, state) {
    await this.updateInitialState(state);
    this.updatePlayingState(inputs, state);
  }
  async updateInitialState(state) {
    if (!state.init) {
      state.init = true;
      // list devices and check the availability of video and audio input devices.
      this.mergeState(await this.enumerateDevices());
    }
  }
  async enumerateDevices() {
    log.groupCollapsed('discover media devices');
    const devices = await navigator.mediaDevices.enumerateDevices();
    let hasVideoInput, hasAudioInput;
    devices.forEach(device =>{
      if (device.kind === 'videoinput') {
        hasVideoInput = true;
      } else if (device.kind === 'audioinput') {
        hasAudioInput = true;
      }
    });
    log(JSON.stringify(devices.map(info => info.label), null, '  '));
    log.groupEnd();
    this.value = devices.map(({deviceId, groupId, kind, label}) => ({deviceId, groupId, kind, label}));
    this.fire('devices');
    return {devices, hasAudioInput, hasVideoInput};
  }
  updatePlayingState({playingvideo, playingaudio}, state) {
    // TODO(jingjin): show warning if user requests audio/video but doesn't
    // have the device.
    playingvideo = (playingvideo === '' || Boolean(playingvideo)) && state.hasVideoInput;
    playingaudio = (playingaudio === '' || Boolean(playingaudio)) && state.hasAudioInput;
    if (playingvideo !== state.playingvideo || playingaudio !== state.playingaudio) {
      state.playingvideo = playingvideo;
      state.playingaudio = playingaudio;
      this.startOrStop(playingvideo, playingaudio);
    }
  }
  async startOrStop(trueToStartVideo, trueToStartAudio) {
    log(trueToStartVideo ? 'STARTING VIDEO' : 'stopping video');
    log(trueToStartAudio ? 'STARTING AUDIO' : 'stopping audio');
    this.fire(trueToStartVideo ? 'starting-video' : 'stopping-video');
    this.fire(trueToStartAudio  ? 'starting-audio' : 'stopping-audio');
    if (!trueToStartVideo) {
      this.haltStream(sharedStream, 'video');
    }
    if (!trueToStartAudio) {
      this.haltStream(sharedStream, 'audio');
    }
    if (trueToStartVideo || trueToStartAudio) {
      const streamPromise = this.produceStream(trueToStartVideo, trueToStartAudio);
      sharedStream = await streamPromise;
    }
    notifySubscribers();
  }
  async produceStream(enableVideo, enableAudio) {
    // these are the droids we are looking for
    const constraints = {
    };
    if (enableVideo) {
      constraints.video = {
        // Prefer the rear-facing camera if available.
        facingMode: "environment",
        // TODO(sjmiles): use my best cam if available
        //deviceId: `c0b484a66035c6517a66ba5768283a03f73950c8a3ec8cb1edac2f39c1992fde`
        //deviceId: '765b8e89f8e6a0630bccbab92cd75323781f9ea796e2fee147abae3c5ad45c07'
      };
    }
    if (enableAudio) {
      constraints.audio = true;
    }
    log(constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (stream && enableVideo) {
      let facingMode = '';
      try {
        facingMode = stream.getVideoTracks()?.pop()?.getSettings().facingMode || '';
        console.log(`live-view::facingMode = "${facingMode}"`);
      } catch(x) {
        // squelch
      }
      this.state = {facingMode};
    }
    return stream;
  }
  haltStream(stream, kind) {
    stream?.getTracks().forEach(track => {
      if (track.kind === kind) {
        track.stop();
      }
    });
  }
}

customElements.define('media-stream', MediaStream);
