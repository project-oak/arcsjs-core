/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({transcript: {interimTranscript, transcript}}) {
  return {
    text: transcript || interimTranscript
  };
},
template: html`
<style>
  :host {
    display: flex;
  }
</style>

<div flex center rows>
  <sl-avatar></sl-avatar>
  <br>
  <sl-badge>shoelace</sl-badge>
  <br>
  <!-- <sl-alert type="primary" open>
    <sl-icon slot="icon" name="info-circle"></sl-icon>
    <strong>This is super informative</strong><br>
    <span>{{text}}</span>
  </sl-alert> -->
  <sl-rating></sl-rating>
</div>
`
});