/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Synthesizer} from './Synthesizer.js';
import {Xen} from '../../Dom/Xen/xen-async.js';
//import {logFactory} from '../../../../env/arcs/js/utils/log.js';

//const log = logFactory(true, 'speech-synthesizer', '#837006');

export class SpeechSynthesizer extends Xen.Async {
  static get observedAttributes() {
    return ['text'];
  }
  _didMount() {
    this.style.display = 'none';
  }
  update({text}, state) {
    if (!state.synthesizer) {
      state.synthesizer = new Synthesizer();
    }
    if (Boolean(text) && text !== state.text) {
      state.synthesizer.synthesize(text);
      state.text = text;
    }
  }
}

customElements.define('speech-synthesizer', SpeechSynthesizer);
