/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

update({classifierResults}, state) {
  const hasResults = classifierResults?.length;
  if (hasResults) {
    state.details = classifierResults;
  }
},

render({}, {details}) {
  return {
    details: this.renderDetails(details)
  };
},

renderDetails(results) {
  return results?.map(({displayName, score}) => ({
    displayName,
    meterStyle: `width: ${score*100}%;`
  }));
},

template: html`
<style>
  :host {
    padding: 12px;
    width: 300px;
    height: 240px;
    box-sizing: border-box;
    display: block;
    border: 1px dotted gray;
    background: #eee;
  }

  [container] {
    width: 100%;
  }

  [meter-container] {
    background-color: #333;
    height: 12px;
    margin: 8px 0;
    border-radius: 16px;
    overflow: hidden;
  }

  [meter] {
    background-color: green;
    height: 100%;
  }
</style>

<div repeat="result_t" container>{{details}}</div>

<template result_t>
  <div rows>
    <div>{{displayName}}</div>
    <div meter-container>
      <div meter xen:style="{{meterStyle}}"></div>
    </div>
  </div>
</template>
`
});
