/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

initialize({}, state) {
  assign(state, {selectedRecords: false, selectedDetails: true});  
},

onSelected({eventlet: {value}}, state) {
  assign(state, {
    selectedRecords: value === 'records',
    selectedDetails: value === 'details',
  });
},

render({}, {selectedRecords, selectedDetails}) {
  return {
    selectedRecords,
    selectedDetails,
    showRecords: String(selectedRecords),
    showDetails: String(selectedDetails)
  };
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-0);
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 16px;
    padding: 100px;
    ${globalThis.themeRules}
  }
  [frame="navigator"] {
    border: 1px solid orange;
    padding: 10px;
  }
  [frame="recordsViewer"] {
    border: 1px solid lightgreen;
    padding: 10px;
  }
  [frame="form"] {
    border: 1px solid purple;
    padding: 10px;
  }
</style>

<div center><b><i>WELCOME  TO   ARCS   DATABASE</i></b></div>
<br>
<div toolbar>
  <span flex></span>
  <select on-change="onSelected">
    <option key="records" selected="{{selectedRecords}}">records</option>
    <option key="details" selected="{{selectedDetails}}">details</option>
  </select>
</div>
<div frame="recordsViewer" display$="{{showRecords}}"></div>
<div frame="navigator" display$="{{showDetails}}"></div>
<div frame="form" display$="{{showDetails}}"></div>
<br>

`
});
