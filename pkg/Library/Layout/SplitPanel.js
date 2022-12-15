/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({layout, style}) {
  const vertical = layout === 'vertical';
  return {
    vertical,
    horizontal: !vertical
  };
},
template: html`
<split-panel xen:style="{{style}}" flex row$="{{vertical}}" column$="{{horizontal}}" vertical="{{vertical}}">
  <div flex column frame="topLeft" slot="top"></div>
  <div flex column frame="bottomRight" slot="bottom"></div>
</split-panel>
`
});
