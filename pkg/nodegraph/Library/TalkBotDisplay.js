/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({input}) {
  return {
    chat: input?.map((p, i) => ({
      speaker: ['Plato', 'Aristotle'][i%2],
      phrase: p
    }))
  };
},
template: html`
<style>
  :host {
    font-size: 0.5em;
  }
</style>

<div flex scrolling repeat="phrase_t">{{chat}}</div>

<template phrase_t>
  <div>
    <b>{{speaker}}</b>
    <blockquote>{{phrase}}</blockquote>
  </div>
</template>
`
});
