({
/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
render({classifierResults}) {
  const hasResults = classifierResults?.length > 0;
  return {
    details: hasResults ? JSON.stringify(classifierResults, null, '  ') : ''
  };
},

template: html`
<style>
  :host {
    width: 240px;
    height: 300px;
    display: block;
    border: 1px dotted gray;
    background: #eeeeee;
  }
  pre {
    padding: 6px;
    margin: 0;
    font-family: monospace;
    font-size: 9px;
  }
</style>

<div flex scrolling rows>
  <pre>{{details}}</pre>
</div>
`
});
