/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({layout, style, endflex, divider}) {
  const vertical = layout === 'vertical';
  return {
    vertical,
    horizontal: !vertical,
    endflex,
    divider
  };
},
template: html`
<split-panel
  flex
  xen:style="{{style}}"
  row$="{{vertical}}"
  column$="{{horizontal}}"
  vertical="{{vertical}}"
  endflex="{{endflex}}"
  divider="{{divider}}"
>
  <slot name="FirstContainer" slot="one"></slot>
  <slot name="SecondContainer" slot="two"></slot>
</split-panel>
`
});
