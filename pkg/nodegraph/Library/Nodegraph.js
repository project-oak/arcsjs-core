/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
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
  /**/
  [left] {
    width: 250px;
    transition: all 200ms ease-in;
  }
  [left][collapsed] {
    transform: translate(-250px, 0);
    width: 0;
    white-space: nowrap;
  }
  [left] > * {
    min-width: 250px;
  }
  /**/
  [right] {
    transition: all 200ms ease-in;
  }
  [right][collapsed] {
    /* transform: translate(280px, 0); */
    width: 0;
    white-space: nowrap;
  }
  /**/
  [frame="toolbar"] [toolbar] {
    padding: 0;
  }
  [nav] {
    border-bottom: 1px solid var(--theme-color-bg-3);
  }
</style>

<page-group flex column>
  <!-- page 1 -->
  <div flex row>
    <!-- left -->
    <div left collapsed$="{{leftCollapsed}}" column section frame="catalog"></div>
    <!-- center -->
    <split-panel vertical flex section row>
      <div slot="left" flex column>
        <!-- top -->
        <div nav toolbar>
          <icon on-click="onToggleLeft">{{leftIcon}}</icon>
          <div flex frame="toolbar"></div>
          <!-- <icon on-click="onToggleRight">{{rightIcon}}</icon> -->
        </div>
        <!-- middle 1 -->
        <split-panel flex column divider="480">
          <div flex column frame="preview" slot="top"></div>
          <div flex column frame="editor" slot="bottom"></div>
        </split-panel>
      </div>
    <!-- right -->
    <div slot="right" right flex column collapsed$="{{rightCollapsed}}" section>
      <split-panel flex column>
        <div flex column frame="inspector" slot="top"></div>
        <div flex column frame="tree" slot="bottom"></div>
      </split-panel>
    </div>
  </div>
  <!-- page 2 -->
  <div flex column frame="pipelines"></div>
</page-group>
`
});
