/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
initialize(inputs, state, {service}) {
  state.login = () => service({msg: 'Login'});
  state.logout = () => service({msg: 'Logout'});
},

async update({profile}, state, {output}) {
  if (profile?.uid) {
    state.login();
  }
},

async onLoginClick(inputs, state, {service}) {
  await state.login();
},

async onLogoutClick(inputs, state, {service}) {
  await state.logout();
},

onPersonaChange({eventlet: {value: persona}}) {
  log(`persona = ${persona}`);
  return {persona};
},

onGroupChange({eventlet: {value: group}}) {
  log(`group = ${group}`);
  return {group};
},

render({group, persona, profile}, state) {
  let loggedIn = Boolean(profile?.uid);
  const photoURL = resolve('$library/App/assets/users/ned.png');
  return {
    photoURL,
    displayName: 'user',
    email: 'user@google.com',
    loginLabel: loggedIn ? 'Start' : 'Login',
    logoutDisbled: !loggedIn,
    persona: persona || '',
    group: group || ''
  };
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
    padding: 12px;
  }
  [profile] {
    min-height: 200px;
    padding: 1em 6em;
    border: 1px solid var(--theme-fg-3);
    transition: opacity 100ms;
  }
  tenant-icon {
    width: 64px;
    height: 64px;
  }
</style>

<div flex center rows xen:style="{{style}}">

  <h2>Welcome!</h2>

  <div flex center rows xen:style="{{opacity}}">
    <div profile rows center>
      <tenant-icon avatar="{{photoURL}}"></tenant-icon>
      <!-- <br><br>
      <b>{{displayName}}</b> -->
      <i>{{email}}</i>
    </div>

    <mwc-textfield helper="Group" helperPersistent outline value="{{group}}" on-change="onGroupChange"></mwc-textfield>
    <mwc-textfield helper="Persona" helperPersistent outline value="{{persona}}" on-change="onPersonaChange"></mwc-textfield>

    <div toolbar>
      <mwc-button raised on-click="onLoginClick">{{loginLabel}}</mwc-button>
      <!-- <span style="width: 24px;"></span>
      <mwc-button on-click="onLogoutClick" disabled="{{logoutDisabled}}">Logout</mwc-button> -->
    </div>

    <br>
  </div>

</div>
`
});
