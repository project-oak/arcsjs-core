/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({text, textStyle}) {
  if (text && !(typeof text === 'string')) {
    text = JSON.stringify(text, null, '  ');
  }
  return {
    text,
    textStyle: textStyle || 'font-weight: bold; color: red; font-size: 18px; text-align: center; padding-top: 100px'
  };
},
template: html`
<style>
  :host {
    min-width: 2em;
    min-height: 1em;
  }
  pre {
    margin: 0; 
    font-size: 0.75em;
    font-family: sans-serif;
  }
</style>
<pre Xnodrag xen:style="{{textStyle}}" flex scrolling>{{text}}</pre>
`
});
