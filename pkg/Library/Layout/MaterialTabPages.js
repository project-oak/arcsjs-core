/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
  render({tabs}) {
    return {
      tabs
    };
  },
  template: html`
<mxc-tab-pages flex tabs="{{tabs}}">
  <slot name="PagesContainer"></slot>
</mxc-tab-pages>
  `
});
