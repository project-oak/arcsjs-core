/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import '../../../env/third_party/wavefile/wavefile.js';
import {DEFAULT_NUM_CHANNELS, DEFAULT_SAMPLE_RATE} from './audio-recorder.js';
import {Xen} from '../../../Dom/Xen/xen-async.js';

const template = Xen.Template.html`
<style>
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  [show="false"] {
    display: none;
  }
  [hide="true"] {
    display: none;
  }
  audio {
    width: 100%;
    height: 54px;
  }
</style>

<audio controls src="{{dataUri}}" show$="{{hasAudioData}}"></audio>
<div no-audio-msg hide$="{{hasAudioData}}">No audio data to play</div>
`;

const WaveFile = globalThis['wavefile'].WaveFile;

/**
 * An audio visualizer/player.
 *
 * It uses the "wavefile" third-party library to convert the raw audio data to
 * wav and feed it to an audio player. Audio's wave form is visualized on a
 * canvas, where users can play, stop, and scrub the audio clip.
 *
 * TODO(jingjin): for now it is using the default audio player. Implement the
 * visualization part.
 *
 * Attributes:
 *   - rawaudiodata: raw audio data (an array of float numbers from 0 to 1).
 */
export class AudioVisualizer extends Xen.Async {
  static get observedAttributes() {
    return ['rawaudiodata'];
  }

  get template() {
    return template;
  }

  async _didMount() {
    this.audio = this._dom.$('audio');
  }

  render({rawaudiodata}, state) {
    let dataUri = '';
    if (rawaudiodata) {
      const wav = new WaveFile();
      wav.fromScratch(
          DEFAULT_NUM_CHANNELS, DEFAULT_SAMPLE_RATE, '32f', rawaudiodata);
      dataUri = wav.toDataURI();
    }
    return {
      dataUri,
      hasAudioData: String(dataUri != null && dataUri !== ''),
    };
  }
}
customElements.define('audio-visualizer', AudioVisualizer);
