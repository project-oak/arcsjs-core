/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async initialize(inputs, state, {service}) {
  state.target = await service({kind: 'MediaService', msg: 'allocateCanvas', data: {width: 640, height: 480}});
},
async update({image}, state, {service}) {
  const mask = await service({kind: 'SelfieSegmentationService', msg: 'classify', data: {image, target: state.target}});
  state.mask = mask;
  return {mask};
},
template: html`
<style>
  :host {
    background-color: black;
    color: #eee;
    overflow: hidden;
  }
</style>
<image-resource center flex image="{{mask}}"></image-resource>
`
});
