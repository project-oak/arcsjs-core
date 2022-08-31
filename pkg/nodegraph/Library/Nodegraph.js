/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
async update({pipeline}, state, {service}) {
  if (!pipeline) {
    //log('created pipeline!')
    return {
      pipeline: {
        $meta: {
          name: await service({msg: 'MakeName'})
        },
        nodes: []
      }
    };
  }
},
render(inputs, {leftCollapsed, rightCollapsed}) {
  return {
    leftCollapsed,
    rightCollapsed,
    leftIcon: leftCollapsed ? 'chevron_right' : 'chevron_left',
    rightIcon: rightCollapsed ? 'chevron_left' : 'chevron_right'
  };
},
onToggleLeft(inputs, state) {
  state.leftCollapsed = !state.leftCollapsed;
},
onToggleRight(inputs, state) {
  state.rightCollapsed = !state.rightCollapsed;
},
template: html`
<style>
  :host {
    color: var(--theme-color-fg-0);
    background-color: var(--theme-color-bg-0);
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 16px;
    ${globalThis.themeRules}
  }
  [section] {
    border-right: 1px solid var(--theme-color-bg-2);
  }
  [left] {
    width: 250px;
    transition: all 200ms ease-in;
  }
  [left][collapsed] {
    transform: translate(-160px, 0);
    width: 0;
    white-space: nowrap;
  }
  [right] {
    transition: all 200ms ease-in;
  }
  [right][collapsed] {
    transform: translate(100%, 0);
    width: 0;
    white-space: nowrap;
  }
  [frame="toolbar"] [toolbar] {
    padding: 0;
  }
  [nav] {
    border-bottom: 1px solid var(--theme-color-bg-3);
  }
</style>

<page-group flex rows>
  <!-- page 1 -->
  <div flex columns>
    <!-- left -->
    <div left collapsed$="{{leftCollapsed}}" rows section frame="catalog"></div>
    <!-- center -->
    <div flex section rows>
      <!-- top -->
      <div nav toolbar>
        <icon on-click="onToggleLeft">{{leftIcon}}</icon>
        <div flex frame="toolbar"></div>
        <icon on-click="onToggleRight">{{rightIcon}}</icon>
      </div>
      <!-- middle 1 -->
      <split-panel flex rows>
        <div flex rows frame="preview" slot="startside"></div>
        <div flex rows frame="editor" slot="endside"></div>
      </split-panel>
    </div>
    <!-- right -->
    <div right center collapsed$="{{rightCollapsed}}" section frame="inspector"></div>
  </div>
  <!-- page 2 -->
  <div flex rows frame="pipelines"></div>
</page-group>
`
});
