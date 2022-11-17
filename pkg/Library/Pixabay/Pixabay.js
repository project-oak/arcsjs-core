/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update({query, index}, state) {
  if (query && !state.query !== query) {
    state.query = query;
    state.image =await this.requestImages(query, index);
  }
},
async requestImages(query, index) {
  const server = `https://pixabay.com/api/?key=31270274-5e18e915d977d3ca8d456a34c&image_type=photo&q=`;
  const response = await fetch(`${server}${query}`, {method: 'GET'});
  const json = await response.json();
  log(json);
  const hits = json?.hits;
  const url = hits?.[index > 0 ? index : 0]?.largeImageURL;
  return {hits, url}
},
onCanvas({eventlet: {value}}, state) {
  if (state.image?.url === value?.url) {
    const image = state.image = {...state.image, canvas: value.canvas, version: Math.random()};
    return {image};
  }
},
template: html`
<style>
  image-resource {
    background: transparent;
  }
</style>
<image-resource center flex image="{{image}}" on-canvas="onCanvas"></image-resource>
`
})
