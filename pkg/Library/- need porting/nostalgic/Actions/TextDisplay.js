/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

render({classifierResults}) {
  const hasResults = classifierResults?.length > 0;
  return {
    details: hasResults ? this.renderDetails(classifierResults) : null
  };
},

renderDetails(results) {
  log(results);
  return {
    $template: 'class_t',
    models: results.map(value => ({value}))
  };
},

template: html`
<style>
  :host {
    display: block;
  }
</style>

<div>{{details}}</div>

<template class_t>
  <pre>{{value}}</pre>
  <!-- <textarea value="{{value}}"></textarea> -->
</template>
`

})
