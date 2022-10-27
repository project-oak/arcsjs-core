/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
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
  a-scene > canvas {
    position: static !important;
  }
  [left] {
    width: 250px;
  }
  [left] > * {
    min-width: 250px;
  }
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
    <split-panel vertical flex row divider="240" endflex="true">
      <div slot="left" flex column>
        <div flex frame="catalog"></div>
      </div>
      <!-- split -->
      <split-panel slot="right" vertical flex row divider="240">
        <div slot="left" flex column>
          <div nav toolbar>
            <div flex frame="toolbar"></div>
          </div>
          <split-panel flex column divider="480">
            <div flex column frame="preview" slot="top"></div>
            <!-- split -->
            <div flex column frame="editor" slot="bottom"></div>
          </split-panel>
        </div>
        <!-- split -->
        <div slot="right" flex column>
          <split-panel flex column>
            <div flex column frame="inspector" slot="top"></div>
            <!-- split -->
            <div flex column frame="tree" slot="bottom"></div>
          </split-panel>
        </div>
      </split-panel>
    </split-panel>
  </div>

  <!-- page 2 -->
  <div flex column frame="pipelines"></div>

</page-group>
`
});
