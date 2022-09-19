/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async initialize(_, state, {service}) {
  state.target = await service({kind: 'MediaService', msg: 'allocateCanvas', data: {width: 640, height: 480}});
},
shouldUpdate({data}) {
  return Boolean(data);
},
async update({data}, state, {service}) {
  await service({kind: 'MediapipeService', msg: 'clear', data: {target: state.target}});
  await service({kind: 'MediapipeService', msg: 'renderFace', data: {data: data.results, target: state.target}});
  await service({kind: 'MediapipeService', msg: 'renderHands', data: {data: data.results, target: state.target}});
  state.outputImage = {
    canvas: state.target,
    version: Math.random()
  };
  return {outputImage: state.outputImage};
},
render({data}, {outputImage}) {
  return {
    image: outputImage,
    stream: data?.image?.stream
  };
},
template: html`
<style>
  :host {
    position: relative;
  }
  image-resource {
    position: absolute;
    inset: 0;
  }
</style>
<stream-view flex stream="{{stream}}"></stream-view>
<image-resource flex image="{{image}}"></image-resource>
`
});
