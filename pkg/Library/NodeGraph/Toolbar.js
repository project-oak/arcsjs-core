/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
render({icons}) {
  return {icons};
},

onClick({eventlet: {key}}) {
  return {event: key};
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
  }
</style>

<div toolbar repeat="icon_t">{{icons}}</div>

<template icon_t>
  <mwc-icon-button title="{{title}}" key="{{key}}" on-click="onClick" icon="{{icon}}" disabled="{{disabled}}"></mwc-icon-button>
</template>
`
});
