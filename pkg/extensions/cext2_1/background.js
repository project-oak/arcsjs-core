/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global chrome */

import {getStream} from './source-stream.js';
import {initRtc} from './web-rtc.js';

import {Resources} from './arcs/index.js';

// for debugging;
globalThis.Resources = Resources;

const imageInputStore = `livecamera1:image`;
const canvasOutputStore = `deviceimage1:output`;

const getArcsStream = async () => new Promise(resolve => {
  console.log('wait for arc spin up');
  setTimeout(() => {
    console.log('setting mediaDeviceState');
    app.arcs.set('user', 'mediaDeviceState', {isCameraEnabled: true, isMicEnabled: false, isAudioEnabled: false});
    console.log('wait for media spin up');
    setTimeout(async () => {
      console.log('get stream data');
      const streamId = await app.arcs.get('user', 'stream');
      const stream = Resources.get(streamId);
      console.log(streamId, stream);
      // resolve with stream
      resolve(stream);
    }, 1000)
  }, 5000);
});

//initRtc(getStream);

const stream =  await getArcsStream();

// const rtcStream = new MediaStream();
// const track = stream.getVideoTracks()[0];
// rtcStream.addTrack(track);

const rtcStream = await getStream(stream);
//console.log(other, stream);

initRtc(async () => rtcStream);

//initRtc(getArcsStream);
