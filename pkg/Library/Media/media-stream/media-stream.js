/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';
import {logFactory} from '../../core.js';

const sharedStreams = {};
const subscribers = {};

export const defaultStreamName = 'default';

export const subscribeToStream = (streamName, fn) => {
  if (!subscribers[streamName]) {
    subscribers[streamName] = [];
  }
  subscribers[streamName].push(fn);
  return sharedStreams[streamName];
};

export const subscribeToDefaultStream = (fn) => {
  return subscribeToStream(defaultStreamName, fn);
};

const notifySubscribers = (streamName) => {
  const sharedStream = sharedStreams[streamName];
  if (sharedStream) {
    subscribers[streamName]?.forEach(fn => fn(sharedStream));
  }
};

const log = logFactory(logFactory.flags.media, 'media-stream', '#837006');

export class MediaStream extends Xen.Async {
  static get observedAttributes() {
    return ['playingvideo', 'playingaudio', 'videodeviceid', 'audioinputdeviceid'];
  }
  async update(inputs, state) {
    await this.updateInitialState(state);
    this.updatePlayingState(inputs, state);
  }
  async updateInitialState(state) {
    if (!state.init) {
      state.init = true;
      // list devices and check the availability of video and audio input devices.
      Object.assign(state, await this.enumerateDevices());
    }
  }
  async enumerateDevices() {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    let hasVideoInput, hasAudioInput;
    const devices = mediaDevices.map(({deviceId, groupId, kind, label}) => ({
      kind,
      deviceId,
      groupId,
      label,
      hasVideoInput: kind === 'videoinput',
      hasAudioInput: kind === 'audioinput',
    }));
    log.groupCollapsed('media devices:');
    log(JSON.stringify(devices.map(info => info.label), null, '  '));
    log.groupEnd();
    this.value = devices;
    this.fire('devices');
    return {devices, hasAudioInput, hasVideoInput};
  }
  updatePlayingState({playingvideo, playingaudio, videodeviceid, audioinputdeviceid}, state) {
    // TODO(jingjin): show warning if user requests audio/video but doesn't
    // have the device.
    playingvideo =
        (playingvideo === '' || Boolean(playingvideo)) && state.hasVideoInput;
    playingaudio =
        (playingaudio === '' || Boolean(playingaudio)) && state.hasAudioInput;
    if (playingvideo !== state.playingvideo ||
        playingaudio !== state.playingaudio ||
        (playingvideo && videodeviceid !== state.videodeviceid) ||
        (playingaudio && audioinputdeviceid !== state.audioinputdeviceid)) {
      state.playingvideo = playingvideo;
      state.playingaudio = playingaudio;
      state.videodeviceid = videodeviceid;
      state.audioinputdeviceid = audioinputdeviceid;
      this.startOrStop(defaultStreamName, playingvideo, playingaudio, videodeviceid, audioinputdeviceid);
    }
  }
  async startOrStop(streamName, trueToStartVideo, trueToStartAudio, videodeviceid, audioinputdeviceid) {
    log(trueToStartVideo ? 'STARTING VIDEO' : 'stopping video');
    log(trueToStartAudio ? 'STARTING AUDIO' : 'stopping audio');
    this.fire(trueToStartVideo ? 'starting-video' : 'stopping-video');
    this.fire(trueToStartAudio  ? 'starting-audio' : 'stopping-audio');
    this.maybeHaltStreams(streamName, !trueToStartVideo, !trueToStartAudio);
    if (trueToStartVideo || trueToStartAudio) {
      try {
        const streamPromise = this.produceStream(trueToStartVideo, trueToStartAudio, videodeviceid, audioinputdeviceid);
        sharedStreams[streamName] = await streamPromise;
      } catch (e) {
        this.maybeHaltStreams(streamName, true, true);
      }
    }
    notifySubscribers(streamName);
  }
  async produceStream(enableVideo, enableAudio, videodeviceid, audioinputdeviceid) {
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
      if (videodeviceid) {
        constraints.video.deviceId = {exact: videodeviceid};
      }
    }
    if (enableAudio) {
      constraints.audio = audioinputdeviceid ? {deviceId: {exact: audioinputdeviceid}} : true;
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
  maybeHaltStreams(streamName, haltVideoStream, haltAudioStream) {
    const sharedStream = sharedStreams[streamName];
    if (sharedStream) {
      if (haltVideoStream) {
        this.haltStream(sharedStream, 'video');
      }
      if (haltAudioStream) {
        this.haltStream(sharedStream, 'audio');
      }
    }
  }
  haltStream(stream, kind) {
    stream?.getTracks().forEach(track => {
      if (track.kind === kind) {
        track.stop();
      }
    });
  }
  render({}, {show, stopped, facingMode}) {
    return {
      show,
      stopped,
      flipVideo: facingMode === 'user' || facingMode === ''
    };
  }
}

customElements.define('media-stream', MediaStream);
