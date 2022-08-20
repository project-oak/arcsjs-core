/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Recognizer} from './Recognizer.js';
import {Xen} from '../../Dom/xen/xen-async.js';

//import {logFactory} from '../../../../env/arcs/js/utils/log.js';

//const log = logFactory(true, 'speech-recognizer', '#837006');

export class SpeechRecognizer extends Xen.Async {
  static get observedAttributes() {
    return ['enabled'];
  }
  _didMount() {
    this.style.display = 'none';
  }
  update({enabled}, state) {
    if (!state.recognizer) {
      state.recognizer = this.createRecognizer();
    }
    this.configureRecognizer(state.recognizer, enabled);
  }
  createRecognizer() {
    const onInit = () => {};
    const onResult = ({transcript, interimTranscript}) => {
      this.value = {interimTranscript, transcript};
      this.fire('transcript', transcript);
    };
    const onEnd = () => {
      this.fire('end');
    };
    return new Recognizer(null, onInit, onResult, onEnd);
  }
  configureRecognizer(recognizer, enabled) {
    if (enabled && !recognizer.recognizing) {
      recognizer.start();
    } else if (!enabled && recognizer.recognizing) {
      recognizer.stop();
    }
  }
}

customElements.define('speech-recognizer', SpeechRecognizer);
