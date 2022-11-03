import { keyDefinitions } from "puppeteer";

/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({chat}) {
  return {chat};
},
shouldRender({chat}) {
  return Boolean(chat);
},
render({chat}) {
  const colors = {};
  chat.forEach(({name}) => {
    if (!colors[name]) {
      colors[name] = ['#00800020', '#80000020', '#00008020'][keys(colors).length%3];
    }
  });
  return {
    chat: chat?.map(({name, phrase}, i) => ({
      style: `padding: 8px; border-radius: 8px; background-color: ${colors[name]};`,
      speaker: name,
      phrase: phrase
    }))
  };
},
template: html`
<style>
  :host {
    font-size: 0.75em;
  }
  blockquote {
    margin: 10px;
  }
</style>

<div flex scrolling repeat="phrase_t">{{chat}}</div>

<template phrase_t>
  <div style="margin: 4px;">
    <b>{{speaker}}</b>
    <blockquote xen:style="{{style}}">{{phrase}}</blockquote>
  </div>
</template>
`
});
