/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
onUserClick() {
  return {showFlyout: true};
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
  /**/
  [frame="toolbar"] [toolbar] {
    padding: 0;
  }
  [top][toolbar] {
    background-color: var(--theme-color-bg-3);
    font-size: 1.4rem;
    padding: 16px;
  }
  [frame] {
    background-color: var(--theme-color-bg-2);
  }
</style>

<div top toolbar>
  <icon>settings</icon>
  &nbsp;
  <span>Simple App</span>
  <span flex></span>
  <icon on-click="onUserClick">face</icon>
</div>

<page-group flex column>

  <!-- page 1 -->
  <split-panel vertical flex row divider="-280">

    <div slot="left" flex left column section frame="catalog"></div>
    <div slot="right" flex column>
      <!-- top -->
      <div nav toolbar>
        <div frame="toolbar" flex></div>
      </div>
      <!-- bottom -->
      <split-panel flex column divider="480">
        <div slot="top" flex column frame="preview"></div>
        <div slot="bottom" flex column frame="editor"></div>
      </split-panel>
    </div>

  </split-panel>

  <!-- page 2 -->
  <div flex column frame="page2"></div>

</page-group>
`
});
