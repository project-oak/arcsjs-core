/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async initialize({index}, state, {service}) {
  state.target = await service({kind: 'MediaService', msg: 'allocateCanvas', data: {width: 640, height: 480}});
  state.media = (msg, data) => service({kind: 'MediapipeService', msg, data});
},
shouldUpdate({data}) {
  return Boolean(data);
},
async update(inputs, state) {
  state.outputImage = await this.updateTarget(inputs, state);
  return {outputImage: state.outputImage};
},
async updateTarget({index, data: {results}, sticker}, {media, target}) {
  sticker = sticker?.canvas;
  // TODO(sjmiles): use one 'media' call not two
  await media('clear', {target});
  await media('renderSticker', {data: results, target, sticker, index});
  return {canvas: target, version: Math.random()};
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
