/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
render({text, textStyle}) {
  if (text && !(typeof text === 'string')) {
    text = JSON.stringify(text);
  }
  return {text, textStyle};
},
template: html`
<style>
  :host {
    min-width: 2em;
    min-height: 4em;
  }
</style>
<div xen:style="{{textStyle}}" flex bar>{{text}}</div>
`
});
