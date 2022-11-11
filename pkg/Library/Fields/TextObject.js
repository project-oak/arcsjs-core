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
    text = JSON.stringify(text, null, '  ');
  }
  return {text, textStyle};
},
template: html`
<style>
  :host {
    min-width: 2em;
    min-height: 4em;
  }
  pre {
    margin: 4px;
    font-size: 0.75em;
    font-family: sans-serif;
  }
</style>
<pre xen:style="{{textStyle}}" flex scrolling>{{text}}</pre>
`
});
