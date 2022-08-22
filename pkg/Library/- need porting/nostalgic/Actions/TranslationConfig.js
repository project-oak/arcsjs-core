/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
/*global assets */
assets: resolve(`$library/nostalgic/Actions/assets`),

render({config, languages}) {
  return {
    configs: [{
      key: 'from',
      languages: this.formatRenderLang(config?.inLang, languages)
    }, {
      key: 'to',
      languages: this.formatRenderLang(config?.outLang, languages)
    }]
  };
},

formatRenderLang(lang, languages) {
  return languages.map(l => ({
    name: l.lang,
    isSelected: l.lang === lang,
    // TODO(mariakleiner): figure out why flags don't show up.
    style: `background-image:url(${assets}/${l.country}.png);`
  }));
},

onSelect({eventlet: {key, value}, config}) {
  log(`${key}=${value}`);
  const update = {[key === 'from' ? 'inLang' : 'outLang'] : value};
  return {config: {...config, ...update}};
},

template: html`
<style>
  :host {
    position: relative;
    overflow: hidden;
    padding: 12px 12px 0;
    width: 350px;
    height: 80px;
  }
  select {
    padding: 5px;
    margin: 10px;
    width: 100px;
  }
</style>

<div columns repeat="lang_t">{{configs}}</div>

<template lang_t>
  <div>
    <span>{{key}}</span>
    <select repeat="option_t" key="{{key}}" on-change="onSelect">{{languages}}</select>
  </div>
</template>

<template option_t>
  <option selected="{{isSelected}}" style$="{{style}}">{{name}}</option>
</template>

`

});
