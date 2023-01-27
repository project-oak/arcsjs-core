/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
update({data}, state) {
  state.showMessage = Boolean(keys(data).length > 0);
},

render({private}, {showMessage}) {
  return {
    showMessage: String(showMessage),
    privacyKind: private ? 'private': 'public'
  };
},

onHide({}, state) {
  state.showMessage = false;
},

template: html`
<style>
  :host {
    /* background-color: var(--theme-color-bg-0); */
    border: 1px solid red;
  }
</style>
<div display$="{{showMessage}}" flex columns>
  <div><span>{{privacyKind}}</span> message sent.</div>
  <mwc-button raised icon="done" on-click="onHide"></mwc-button>
</div>
`
});
