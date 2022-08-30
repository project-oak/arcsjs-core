/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.stream = {
    id: 'foo',
    version: 0
  };
},
update(inputs, {stream}) {
  return {
    outputStream: stream
  };
},
template: html`
<style>
  /* :host {
  } */
</style>
`
});
