/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({
update({viewMode}, state) {
  this.updateSelected(viewMode, state);
},

onSelected({eventlet: {value: viewMode}}, state) {
  this.updateSelected(viewMode, state);
  return {viewMode};
},

updateSelected(viewMode, state) {
  assign(state, {
    selectedRecords: viewMode === 'records',
    selectedDetails: viewMode === 'details'
  });
},

template: html`
  <select on-change="onSelected">
    <option key="records" selected="{{selectedRecords}}">records</option>
    <option key="details" selected="{{selectedDetails}}">details</option>
  </select>
`
});
