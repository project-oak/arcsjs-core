/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

render({imageRef, classifierResults, status}) {
  const working = status === 'working';
  const complete = status === 'complete';
  const noImage = !imageRef;
  const noProcessor = !noImage && !working && !complete;
  const hasResults = complete && classifierResults?.length > 0;
  const noResults = complete && !hasResults;
  return {
    displayMessage: noImage ? 'no image data' : noProcessor ? 'no processor' : noResults ? 'no results' : '',
    displayProgress: String(working),
    hideDetails: !hasResults
  };
},

template: html`

<style>
  :host {
    display: block;
    padding: 8px;
  }
  mwc-linear-progress {
    align-self: stretch;
  }
</style>

<div flex center rows>

  <mwc-linear-progress display$="{{displayProgress}}" indeterminate></mwc-linear-progress>
  <div>{{displayMessage}}</div>
  <div hidden="{{hideDetails}}" slot="details"></div>

</div>
`
});
