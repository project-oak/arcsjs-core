/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

update({selectedRecord}, state) {
  assign(state, {
    showRecords: String(!selectedRecord),
    showDetails: String(Boolean(selectedRecord))
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
  [name="chooser"] {
    border: 1px solid grey;
    padding: 10px;
  }
  [name="recordsViewer"] {
    border: 1px solid lightgreen;
    padding: 10px;
  }
  [name="form"] {
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
    <slot name="navigator" xdisplay$="{{showDetails}}"></slot>
  </div>  
</div>
<slot name="recordsViewer" display$="{{showRecords}}"></slot>
<slot name="form" display$="{{showDetails}}"></slot>
<br>

`
});
