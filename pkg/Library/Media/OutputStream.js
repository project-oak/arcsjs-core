/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

async initialize(inputs, state, {service}) {
  state.stream = await service({kind: 'ThreejsService', msg: 'allocateResource'});
},

async update({image}, state, {service}) {
  const {stream} = state;
  const canvas = image?.canvas;
  if (canvas != state.canvas) {
    state.canvas = canvas;
    if (canvas) {
      await service({msg: 'captureStream', data: {canvas, stream}});
      return {stream};
    }
  }
},

render(inputs, {stream}) {
  return {
    stream
  };
},

template: html`
<style>
  :host {
    position: relative;
    overflow: hidden;
    width: 160px;
    height: 128px;
  }
  stream-view {
    width: 100%;
    height: 100%;
  }
</style>
<!-- <div>{{stream}}</div> -->
<stream-view stream="{{stream}}"></stream-view>
`
});
