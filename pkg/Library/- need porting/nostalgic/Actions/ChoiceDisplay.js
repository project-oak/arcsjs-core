/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

update({transcript}, state) {
  const text = String(transcript?.transcript || '').toLowerCase();
  const textContains = (...terms) => terms.every(term => text.includes(term));
  if (textContains('ticket', 'vegas') || textContains('train', 'vegas')) {
    state.renderModel = {
      choiceTitle: 'Amtrak Plus',
      choiceSummary: 'San Francisco to Las Vegas',
      choices: [{choice: '7pm, $59'}, {choice: '9pm, $72'}]
    };
  }
},

render(inputs, {renderModel}) {
  return renderModel;
},

template: html`
<style>
  :host {
    display: block;
    padding: 8px;
  }
  [small] {
    font-size: 0.9em;
    padding: 8px 0;
  }
  [large] {
    font-size: 1.0em;
  }
  [capsule] {
    border: 1px solid #555A;
    border-radius: 64px;
    padding: 10px 24px;
    margin-bottom: 10px;
  }
</style>

<div flex center rows>
  <div small center rows>
    <div>{{choiceTitle}}</div>
    <div>{{choiceSummary}}</div>
  </div>
  <div large center rows repeat="choice_t">{{choices}}</div>
</div>

<template choice_t>
  <div capsule>
    <div info>{{choice}}</div>
  </div>
</template>
`
});
