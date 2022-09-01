/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

render({group, persona, profile}, state) {
  return {
    persona: persona || '',
    group: group || ''
  };
},
  
onPersonaChange({eventlet: {value: persona}}) {
},

onGroupChange({eventlet: {value: group}}) {
  log(`group = ${group}`);
  return {group};
},

onDone() {
  return {showFlyout: false};
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-0);
    background-color: var(--theme-color-bg-0);
    overflow: hidden;
    padding: 0.5em;
  }
  mwc-textfield {
    text-align: center;
    --mdc-text-field-fill-color: var(--theme-color-bg-0);
    --mdc-typography-subtitle1-font-size: 1.5em;
    --mdc-text-field-label-ink-color: lightgrey;
    --mdc-text-field-disabled-ink-color: lightgrey;
    padding: 12px;
  }
</style>

<div flex center rows xen:style="{{style}}">

  <h2>Lobby Settings</h2>

  <div flex center rows xen:style="{{opacity}}">
    <mwc-textfield helper="Group" helperPersistent outline value="{{group}}" on-change="onGroupChange"></mwc-textfield>
    <mwc-textfield disabled helper="Persona" helperPersistent outline value="{{persona}}" on-change="onPersonaChange"></mwc-textfield>

    <div toolbar>
      <mwc-button raised on-click="onDone">Done</mwc-button>
    </div>

    <br>
  </div>

</div>
`
});
