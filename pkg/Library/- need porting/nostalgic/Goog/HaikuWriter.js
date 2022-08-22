/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
async update({}, state, {service}) {
  if (!state.lines) {
    const name = await service({msg: 'MakeName'});
    const themes = name.replace(/([A-Z])/g, ' $1').trim().split(' ');
    state.themes = themes;
    state.lines = await this.updatePoem(service, themes[0], themes[1]);
  }
},
async updatePoem(service, theme0, theme1) {
  const response = await this.runMacro(service, 'OVTvQHJU1zEmRhtiD2tU', {
    "33ccae12-3578-4cbf-8cd5-99c3a758ecea": theme0,
    "8b7440f1-2e37-44c2-8975-4a0bbc1e917e": theme1
  });
  const lines = [];
  const text = response?.messages?.[0].text;
  if (text) {
    const tokens = text.split('\n');
    if (tokens) {
      for (const token of tokens) {
        if (token.trim().length == 0) continue;
        if (token.startsWith(`Theme`)) break;
        lines.push(token.trim());
      }
    }
  }
  return lines;
},
async runMacro(service, macroId, inputs) {
  const data = {macroId, inputs};
  return await service({kind: 'GoogleApisService', msg: 'runMacro', data});
},
render({}, {lines, themes}) {
  return {
    lines: lines.map(l => ({line: l})),
    themes: themes.join(' • ') //map(t => ({theme: t}))
  };
},
template: html`
<style>
  :host {
    padding: 12px 12px 0;
    color: lightgrey;
  }
  [theme] {
    font-size: 0.8em;
    font-style: italic;
    font-weight: normal;
  }
</style>

<div flex center rows>
  <div flex center rows repeat="line_t">{{lines}}</div>
  <div theme>{{themes}}</div>
  <!-- <div theme flex center rows large repeat="theme_t">{{themes}}</div> -->
</div>

<template line_t>
  <div>{{line}}</div>
</template>

<template theme_t>
  <span>{{theme}}</span>
</template>
`
});
