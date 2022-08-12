/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const XenCss = `
* {
  box-sizing: border-box;
}
[rows], [column], [columns], [row], [bar], [toolbar] {
  display: flex;
  align-items: stretch;
}
[rows], [column] {
  flex-direction: column;
}
[centered][rows], [centered][column], [centering][columns], [centering][row], [bar], [toolbar] {
  align-items: center;
}
[centered][columns], [centered][row], [centering][rows], [centering][column] {
  justify-content: center;
}
[center] {
  justify-content: center;
  align-items: center;
  text-align: center;
  align-content: center;
}
[right-aligned] {
  justify-content: right;
  align-items: right;
  text-align: right;
}
[bar], [toolbar]  {
  white-space: nowrap;
}
[toolbar] {
  padding: 8px;
}
[toolbar] > * {
  margin-right: 8px;
}
[toolbar] > *:last-child {
  margin-right: 0;
}
[fullbleed] {
  height: 100%;
  width: 100%;
  margin: 0;
  overflow: hidden;
}
[dark] {
  color-scheme: dark;
}
[scrolling] {
  overflow: auto !important;
}
[flex][scrolling] {
  height: 0;
  flex: 1 1 auto;
}
[grid] {
  display: flex;
  flex-wrap: wrap;
}
[flex] {
  flex: 1;
  flex-basis: 0px;
  overflow: hidden;
}
[flex][x2] {
  flex: 2;
}
[flex][x3] {
  flex: 3;
}
[flex][x4] {
  flex: 4;
}
[flex][x5] {
  flex: 5;
}
[flex][x6] {
  flex: 6;
}
[flex][x7] {
  flex: 7;
}
[hidden], [hide]:not([hide="false"]), [display="hide"], [display="false"], [show="false"] {
  display: none !important;
}
[invisible] {
  visibility: hidden;
}
[noclip] {
  overflow: visible;
}
[trbl] {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
[no-events] {
  pointer-events: none;
}
`;