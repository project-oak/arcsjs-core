/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({fps, stream}, {}) {
  return {
    fps,
    stream
  };
},
onCanvas({eventlet: {value: ref}, stream}) {
  return {
    frame: {
      canvas: ref,
      version: Math.random(),
      stream
    }
  };
},
template: html`
<stream-view flex stream="{{stream}}" frequency="{{fps}}" on-canvas="onCanvas"></stream-view>
`
});
