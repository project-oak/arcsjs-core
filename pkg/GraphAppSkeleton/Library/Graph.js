/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldRender({graph, layoutId}) {
  return Boolean(graph && layoutId);
},
render({graph, layoutId}) {
  return {
    rects: map(graph.layout?.[layoutId], (id, position) => ({id, position}))
  }
},
template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-0);
    ${globalThis.themeRules}
  }
  designer-layout {
    background: white;
  }
</style>
<designer-layout flex disabled frame="root" rects="{{rects}}"></designer-layout>
`
});
