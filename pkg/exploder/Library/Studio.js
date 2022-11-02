/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
async update({graph}, state, {service}) {
  if (!graph) {
    //log('created graph!')
    return {
      graph: {
        $meta: {
          name: await service({msg: 'MakeName'})
        },
        nodes: {}
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
  ${`:host {
    ${scope.themeRules}
  }`}
  :host {
    color: var(--theme-color-fg-0);
    background-color: var(--theme-color-bg-0);
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 16px;
  }
  [section] {
    border-right: 1px solid var(--theme-color-bg-2);
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
    <!-- center -->
    <div flex section rows>
      <!-- top -->
      <div nav toolbar>
        <div flex frame="toolbar"></div>
      </div>
      <!-- middle 2 -->
      <div flex x2 rows frame="editor"></div>
    </div>
    <!-- right -->
    <div right center collapsed$="{{rightCollapsed}}" section frame="inspector"></div>
  </div>
  <!-- page 2 -->
  <div flex rows frame="graphs"></div>
</page-group>
`
});
