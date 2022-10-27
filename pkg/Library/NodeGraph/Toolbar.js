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
  return {
    icons: icons?.map(this.renderIcon)
  };
},

renderIcon({hidden, separator, ...props}) {
  const showIcon = Boolean(!hidden);
  const showSeparator = Boolean(separator);
  return {
    ...props,
    showIcon: String(showIcon),
    showSeparator: String(showIcon && showSeparator)
  };
},

onClick({eventlet: {key}}) {
  return {event: key};
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
  }
  [separator] {
    width: 2px;
    border-right: 1px solid var(--theme-color-bg-3);
  }
</style>

<div toolbar repeat="icon_t">{{icons}}</div>

<template icon_t>
  <div columns>
    <mwc-icon-button title="{{title}}" key="{{key}}" on-click="onClick" icon="{{icon}}" disabled="{{disabled}}" display$={{showIcon}}></mwc-icon-button>
    <div column separator display$={{showSeparator}}></div>
  </div>
</template>
`
});
