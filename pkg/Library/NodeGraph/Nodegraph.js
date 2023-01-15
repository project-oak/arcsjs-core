/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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
  [toolbar] {
    padding: 0;
  }
  [nav] {
    border-bottom: 1px solid var(--theme-color-bg-3);
  }
</style>

<div><slot name="device"></slot></div>

<page-group flex column>

  <!-- page 1 -->
  <div flex row>
    <split-panel vertical flex row divider="240" endflex="true">
      <div slot="left" flex column>
        <slot name="catalog"></slot>
      </div>
      <split-panel slot="right" vertical flex row divider="240">
        <div slot="left" flex column>
          <div nav toolbar>
            <slot name="toolbar"></slot>
          </div>
          <split-panel flex column divider="480">
            <slot slot="top" name="preview"></slot>
            <slot slot="bottom" name="editor"></slot>
          </split-panel>
        </div>
        <div slot="right" flex column>
          <split-panel flex column>
            <slot slot="top" name="inspector"></slot>
            <slot slot="bottom" name="tree"></slot>
          </split-panel>
        </div>
      </split-panel>
    </split-panel>
  </div>

  <!-- page 2 -->
  <div flex column><slot name="graphs"></slot></div>

</page-group>
`
});
