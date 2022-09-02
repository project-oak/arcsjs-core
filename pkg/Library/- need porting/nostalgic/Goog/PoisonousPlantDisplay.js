/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({plantInfo}) {
  const display = boolean => boolean ? 'show' : 'hide';
  log(plantInfo);
  if (plantInfo) {
    const {name, isPoisonous} = plantInfo;
    const showPoisonous = display(Boolean(isPoisonous));
    const showNotPoisonous = display(isPoisonous !== undefined && !isPoisonous);
    return {
      name,
      showAll: display(true),
      showPoisonous,
      showNotPoisonous
    };
  }
  return {
    showAll: display(false)
  };
},
template: html`
<style>
  :host {
    padding: 12px 12px 0;
    color: lightgrey;
    font-weight: normal;
  }
  [poisonous] {
    font-style: italic;
    color: red;
  }
  [not-poisonous] {
    font-style: italic;
    color: green;
  }
</style>

<div display$="{{showAll}}">
  <div>This plant is <span><b>{{name}}</b></span>.</div>
  <div poisonous display$="{{showPoisonous}}">It is <b>poisonous</b>.</div>
  <div not-poisonous display$="{{showNotPoisonous}}">It is <span><b>NOT</b></span> poisonous.</div>
</div>
`
});
