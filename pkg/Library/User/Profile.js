/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.login = () => service({msg: 'Login'});
  state.logout = () => service({msg: 'Logout'});
},

async update({profile}, state, {output}) {
  // let time = 300;
  // state.opacity = {opacity: 0};
  if (profile?.uid) {
    // state.style = {display: 'none'};
    state.login();
    // time = 300;
  } else {
    // state.style = {display: null};
    // await output({});
  }
  // buy some `time` to complete login bookkeeping
  // before fading in the login screen
  // await timeout(() => state.opacity = {opacity: 1}, time);
},

async onLoginClick(inputs, state, {service}) {
  await state.login();
},

async onLogoutClick(inputs, state, {service}) {
  await state.logout();
},

onPersonaChange({eventlet: {value: persona}}) {
  log(persona);
  return {persona};
},

render({persona, profile}, state) {
  let loggedIn = Boolean(profile?.uid);
  const photoURL = resolve('$library/App/assets/users/ned.png');
  return {
    photoURL,
    displayName: 'user',
    email: 'user@google.com',
    loginLabel: loggedIn ? 'Start' : 'Login',
    logoutDisbled: !loggedIn,
    persona: persona || '',
    // ...profile,
    // ...state
  };
},

template: html`
<style>
  :host {
    background-color: var(--theme-color-bg-0);
    color: black;
    overflow: hidden;
    padding: 0.5em;
  }
  h2 {
    margin: 0;
    padding: 0;
  }
  mwc-textfield {
    /* text-align: center; */
    --mdc-text-field-fill-color: var(--theme-color-bg-0);
    --mdc-typography-subtitle1-font-size: 1.1em;
    /* padding: 12px; */
  }
  [profile] {
    border: 1px solid var(--theme-fg-3);
    transition: opacity 100ms;
  }
  [form] {
    padding: 12px;
  }
  tenant-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 8px;
  }
</style>

<div Xcenter rows Xxen:style="{{style}}">

  <div column>

    <div centered row>

      <div flex centered column profile>
        <tenant-icon avatar="{{photoURL}}"></tenant-icon>
        <b>{{displayName}}</b>
        <i>{{email}}</i>
      </div>

      <div flex center column form>
        <!-- <h2>Welcome!</h2> -->
        <mwc-textfield helper="Persona" helperPersistent outline value="{{persona}}" on-change="onPersonaChange"></mwc-textfield>
      </div>

    </div>

    <div toolbar>
      <!-- <mwc-button raised on-click="onLoginClick">{{loginLabel}}</mwc-button> -->
      <!-- <span style="width: 24px;"></span>
      <mwc-button on-click="onLogoutClick" disabled="{{logoutDisabled}}">Logout</mwc-button> -->
    </div>

  </div>

</div>
`
});
