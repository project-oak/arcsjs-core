/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
template: html`
<style>
  ${`:host {
    ${globalThis?.themeRules}
  }`}
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-1);
    border-color: var(--theme-color-bg-2);
    border: 1px solid;
    /* border-bottom-left-radius: 36px;
    border-bottom-right-radius: 36px; */
    overflow: hidden;
  }
  [slot="media"] {
    padding: 8px 4px;
  }
  [container] {
    position: relative;
  }
  #login {
    position: absolute;
    inset: 0;
  }
  #user {
    position: relative;
    background: repeating-linear-gradient(
      45deg,
      #f1f1f1,
      #f1f1f1 10px,
      #eeeeee 10px,
      #eeeeee 20px
    );
    /* pointer-events: none; */
  }
  /* #user #arcs-surface > * {
    pointer-events: initial;
  } */
</style>

<div row>
  <div flex frame="media"></div>
</div>

<div flex rows container>
  <div flex rows id="user"></div>
</div>
`
});
