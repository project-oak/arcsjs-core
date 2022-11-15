/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const paletteRules = palette => palette.map((c, i) => `--theme-color-${i}: ${c};`).join('\n    ');
const newPaletteRules = palette => palette.map((c, i) => `--theme-color-${i < 5 ? 'bg-' : 'fg-'}${i%5}: ${c};`).join('\n    ');

// const lightTheme = [
//   "#edf2fb","#e2eafc","#d7e3fc","#ccdbfd","#c1d3fe",
//   "#b6ccfe","#abc4ff","#8075ffff","#6320eeff","#211a1dff"
// ];

/* Array */
const monoTheme = [
  "#f8f9fa","#e9ecef","#dee2e6","#ced4da","#f0f2f3",
  "#6c757d","#495057","#343a40","#212529","black"
];

const darkTheme = [
  "#585858", "#d9d9d9", "#6c6c6d", "#3a3a3a", "#533b5f",
  "#d9d9d9", "#585858", "#63f469", "#fdfdfd", "violet"
];

const theme = {
  mono: monoTheme,
  dark: darkTheme
}[globalThis.config?.theme || 'mono'];

export const themeRules =`
${paletteRules(theme)}
${newPaletteRules(theme)}
  --code-mirror-font-size: 11px;
  color: var(--theme-color-fg-0);
  --font-subheader: 500 16px "Google Sans", sans-serif;
  --font-body-1: 400 16px "Google Sans", sans-serif;
  --font-body-2: 400 14px "Google Sans", sans-serif;
  --font-caption: 400 12px "Google Sans", sans-serif;
  --font-button-label: 500 14px "Google Sans", sans-serif;
  /**/
  --mdc-theme-primary: var(--theme-color-fg-0);
  --mdc-theme-on-primary: var(--theme-color-bg-0);
  --mdc-theme-secondary: var(--theme-color-fg-4);
  --mdc-theme-on-secondary: var(--theme-color-bg-4);
  --mdc-tab-height: 32px;
  --mdc-tab-color-default: var(--theme-color-bg-2);
  --mdc-linear-progress-buffer-color: var(--theme-color-fg-3);
`.trim();
