/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../Xen/xen-async.js';
import './lib/codemirror.min.js';
import './lib/javascript.min.js';
import {css as codeMirrorCss} from './themejs/codemirror.css.js';
import {css as materialDarkerCss} from './themejs/material-darker.css.js';

const {CodeMirror} = window;

const template = Xen.Template.html`
<style>${codeMirrorCss}</style>
<style>${materialDarkerCss}</style>
<style>
  :host {
    display: flex;
    flex-direction: column;
    font-family: monospace;
  }
  .CodeMirror {
    font-size: var(--code-mirror-font-size, inherit);
    font-family: var(--code-mirror-font-family, 'Google Sans'), sans-serif;
    background-color: #333 !important;
    flex: 1;
  }
</style>

`;

export class CodeMirrorElement extends Xen.Async {
  static get observedAttributes() {
    return ['text', 'readonly'];
  }
  get template() {
    return template;
  }
  get value() {
    return this.mirror?.getValue() || '';
  }
  _didMount() {
    const container = this.host;
    this.mirror = CodeMirror(container, {
      mode: 'javascript',
      lineNumbers: true,
      theme: 'material-darker' //'blackboard'
    });
    this.observeCodeMirror(this.mirror, this.onMirrorChanges.bind(this), this.onMirrorBlur.bind(this));
  }
  observeCodeMirror(mirror, onchanges, onblur) {
    // react to edits
    mirror.on('changes', onchanges);
    mirror.on('blur', onblur);
    // update mirror layout when host size changes
    (new ResizeObserver(() => mirror.refresh())).observe(this);
  }
  update({text, readonly}, state) {
    this.mirror.setOption('readOnly', readonly);
    if (text != state.text) {
      state.text = text;
      if (text != this.value) {
        this.setMirrorText(text);
        this.clearHistory();
      }
    }
  }
  clearHistory() {
    this.mirror.clearHistory();
  }
  setMirrorText(text) {
    this.squelch = true;
    try {
      this.mirror.setValue(text);
    } finally {
      this.squelch = false;
    }
  }
  onMirrorChanges() {
    if (!this.squelch) {
      this.fire('input');
      this.fire('changes');
    }
  }
  onMirrorBlur() {
    this.fire('code-blur');
  }
}

customElements.define('code-mirror', CodeMirrorElement);