/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
onCodeChanges({eventlet: {value}}, state) {
  return {text: value};
},
shouldRender(inputs, state) {
  const dirty = inputs.text !== state.text;
  state.text = inputs.text;
  return dirty;
},
template: html`
<code-mirror flex text="{{text}}" on-changes="onCodeChanges"></code-mirror>
`
});
