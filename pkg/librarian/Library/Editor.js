/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
update({name, library}, state) {
  assign(state, library?.[name] || {code: '', html: ''});
},
onChanges({name, library, eventlet: {key, value}}, state) {
  state[key] = value;
  const {code, html, meta} = state;
  return {
    library: {
      ...library,
      [name]: {code, html, meta}
    }
  };
},
async onManifestParticle(inputs, {code, html, meta}, {service}) {
  return service({msg: 'addParticle', data: {code, html, meta}});
},
template: html`
<style>
  :host {
    font-size: 0.75em;
    flex: none !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 5px;
    border: 1px solid gray;
    /* padding: 2px; */
    margin: 4px;
    width: 320px;
    height: 240px;
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 12px;
    --mdc-tab-height: 24px;
    --mdc-typography-button-font-size: 0.875em;
    background: #eee;
  }
  mxc-tab-pages {
    background: #fff;
  }
  [toolbar] {
    color: #fafafa;
    background: #edaf22;
    padding: 0 0 2px 6px;
  }
</style>
<div toolbar>
  <span flex>{{name}}</span>
  <mwc-icon-button icon="add" on-click="onManifestParticle"></mwc-icon-button>
</div>
<mxc-tab-pages flex tabs="Html, Js, Meta">
  <code-mirror flex text="{{html}}" key="html" on-changes="onChanges"></code-mirror>
  <code-mirror flex text="{{code}}" key="code" on-changes="onChanges"></code-mirror>
  <code-mirror flex text="{{meta}}" key="meta" on-changes="onChanges"></code-mirror>
</mxc-tab-pages>
`
});