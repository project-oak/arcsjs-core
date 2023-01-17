/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/Xen/xen-async.js';
import {subscribeToDefaultStream} from '../media-stream/media-stream.js';

export const DEFAULT_SAMPLE_RATE = 16000;
export const DEFAULT_NUM_CHANNELS = 1;
const DEFAULT_FFT_SIZE = 32;

/**
 * An audio recorder.
 *
 * Attributes:
 *   - start: setting it to true to start recording, false to stop recording.
 *
 * Events:
 *   - stream:
 *       fired when the availability of the audio stream changes.
 *   - recordended:
 *       fired when the record is ended. Its value is the raw audio data
 *       (an array of float numbers from 0 to 1) of the recorded clip.
 *   - fftdataupdated:
 *       fired continuously during a recod session. Its value is the FFT data
 *       (Uint8Array, often used to visualize the audio being recorded).
 */
export class AudioRecorder extends Xen.Async {
  static get observedAttributes() {
    // TODO(jingjin): allow users to set sample rate, number of channels, fft
    // size, etc.
    return ['start'];
  }

  getInitialState() {
    return {stream: this.getMediaStream()};
  }

  getMediaStream() {
    // listen to media-stream and set it's data into state
    return subscribeToDefaultStream(stream => {
      this.mergeState({stream});

      // Special handling when an audio stream ends.
      //
      // It is needed because when an audio track in a stream is closed, the
      // stream object itself doesn't change.
      if (!this.hasAudioTracks(stream)) {
        this.value = false;
        this.fire('stream');

        if (this.state.recording) {
          this.stopRecording();
        }
      }
    });
  }

  update({start}, state) {
    const audioStreamAvailable =
        Boolean(state.stream) && this.hasAudioTracks(state.stream);

    // Handle "stream" event.
    if (state.lastStream !== state.stream) {
      state.lastStream = state.stream;

      this.value = audioStreamAvailable;
      this.fire('stream');
    }

    // Control recording.
    if (audioStreamAvailable) {
      if (start) {
        this.startRecording();
      } else if (state.recording) {
        this.stopRecording();
      }
    }
  }

  startRecording() {
    const state = this.state;
    state.recording = true;

    // Setup.
    state.audioContext = new AudioContext({sampleRate: DEFAULT_SAMPLE_RATE});
    const source = state.audioContext.createMediaStreamSource(state.stream);

    // Connect a script processor node for getting raw data (float number
    // between 0 and 1).
    //
    // TODO(jingjin): use AudioWorkletNode.
    state.audioData = [];
    const dataAnalyser = state.audioContext.createScriptProcessor(
        4096, DEFAULT_NUM_CHANNELS, DEFAULT_NUM_CHANNELS);
    dataAnalyser.onaudioprocess = (e) => {
      state.audioData.push(...e.inputBuffer.getChannelData(0));
    };
    source.connect(dataAnalyser);
    dataAnalyser.connect(state.audioContext.destination);

    // Connect an analyser node for visualization.
    state.fftDataBuffer = new Uint8Array(DEFAULT_FFT_SIZE / 2);
    state.visualizationAnalyser = state.audioContext.createAnalyser();
    state.visualizationAnalyser.fftSize = DEFAULT_FFT_SIZE;
    state.visualizationAnalyser.channelCount = DEFAULT_NUM_CHANNELS;
    state.visualizationAnalyser.channelInterpretation = 'speakers';
    source.connect(state.visualizationAnalyser);
    this.updateVisualization();
  }

  updateVisualization() {
    this.state.visualizationAnalyser.getByteFrequencyData(
        this.state.fftDataBuffer);
    this.value = this.state.fftDataBuffer;
    this.fire('fftdataupdated')

    this.state.rafId = requestAnimationFrame(() => this.updateVisualization());
  }

  stopRecording() {
    this.state.recording = false;

    // Clean up.
    //
    // TODO(jingjin): stop audio tracks?
    this.state.audioContext.close();
    cancelAnimationFrame(this.state.rafId);

    // Notify with raw audio data.
    this.value = this.state.audioData;
    this.fire('recordended')
  }

  hasAudioTracks(stream) {
    return stream.getAudioTracks().some(track => track.readyState !== 'ended');
  }
}

customElements.define('audio-recorder', AudioRecorder);
