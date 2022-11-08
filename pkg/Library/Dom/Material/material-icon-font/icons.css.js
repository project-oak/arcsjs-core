 /**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const IconsCss = `
:host {
  --mdc-icon-font: "Material Symbols Outlined"
}

icon {
  font-family: "Material Symbols Outlined";
  font-size: 24px;
  font-style: normal;
  font-feature-settings: "liga";
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  /* partial FOUC prevention */
  width: 24px;
  height: 24px;
  overflow: hidden;;
}
`;
