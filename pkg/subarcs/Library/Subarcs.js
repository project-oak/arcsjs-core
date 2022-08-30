/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
initialize(inputs, state) {
  state.keys = {};
},
update(inputs, state, tools) {
  this.updateLibrary(inputs, state, tools);
},
async updateLibrary({library}, state, {service}) {
  const keys = library?.keys;
  if (keys) {
    for (let key of keys) {
      if (!state.keys[key]) {
        state.keys[key] = true;
        const data = {...library.get(key), name: key};
        await service({msg: 'addEditor', data});
      }
    }
  }
},
async onAddEditor({library}, state, {service}) {
  const name = await service({msg: 'makeName'});
  return {library: {...library, [name]: {name}}};
},
template: html`
<style>
  [workbench] {
    padding: 8px;
  }
  [toolbar] {
    background: aliceblue;
  }
  [frame=editors] {
    overflow-x: scroll;
    border: 2px solid #cccccc;
  }
  [frame=canvas] {
    flex-wrap: wrap;
    padding: 8px;
    border: 2px solid #dddddd;
  }
</style>
<div toolbar>
  <mwc-button icon="add" on-click="onAddEditor"></mwc-button>
</div>
<!-- <div workbench flex column></div> -->
<split-panel workbench flex>
  <div flex slot="startside" frame="editors"></div>
  <div flex slot="endside" frame="canvas"></div>
</split-panel>
`
});