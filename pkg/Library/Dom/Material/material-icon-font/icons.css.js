/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const IconsCss = `
icon {
  font-family: "Material Icons";
  font-style: normal;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  vertical-align: middle;
  /* partial FOUC prevention */
  display: inline-block;
  /*
  font-size: 24px;
  width: 24px;
  height: 24px;
  */
  overflow: hidden;
}
icon[hidden] {
  /* required because of display rule above,
      display rule required for overflow: hidden */
  display: none;
}
`;
