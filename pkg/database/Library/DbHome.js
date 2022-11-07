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
  assign(state, {
    showRecords: String(viewMode === 'records'),
    showDetails: String(viewMode === 'details')
  });
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
  [frame="chooser"] {
    border: 1px solid grey;
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
  [toolbar] {
    border: 1px solid orange;
  }
</style>

<div center><b><i>WELCOME  TO   ARCS   DATABASE</i></b></div>
<br>
<div toolbar>
  <div flex>
    <div frame="navigator" xdisplay$="{{showDetails}}"></div>
  </div>  
  <div frame="chooser"></div>
</div>
<div frame="recordsViewer" display$="{{showRecords}}"></div>
<div frame="form" display$="{{showDetails}}"></div>
<br>

`
});
