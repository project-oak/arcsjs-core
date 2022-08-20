({
/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
render({classifierResults}) {
  const hasResults = classifierResults?.length > 0;
  if (hasResults) {
    return {
      details: JSON.stringify(classifierResults, null, '  ')
    };
  }
},

template: html`
<style>
  :host {
    display: block;
  }
  pre {
    margin: 0;
    font-family: monospace;
    font-size: 12px;
    overflow: auto;
  }
</style>

<div scrolling rows>
  <pre>{{details}}</pre>
</div>
`
});
