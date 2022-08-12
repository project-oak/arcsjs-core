import { resolve } from "path";

({
  /**
   * @license
   * Copyright (c) 2022 Google LLC All rights reserved.
   * Use of this source code is governed by a BSD-style
   * license that can be found in the LICENSE file.
   */

  initialize(inputs, state, {service}) {
    state.login = () => service({msg: 'Login'});
    state.logout = () => service({msg: 'Logout'});
  },

  async update({profile}, state, {output}) {
    let time = 300;
    state.opacity = {opacity: 0};
    if (profile?.uid) {
      state.style = {display: 'none'};
      state.login();
      time = 300;
    } else {
      state.style = {display: null};
      await output({});
    }
    // buy some `time` to complete login bookkeeping
    // before fading in the login screen
    await timeout(() => state.opacity = {opacity: 1}, time);
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
      persona,
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
    }
    mwc-textfield {
      text-align: center;
      --mdc-text-field-fill-color: var(--theme-color-bg-0);
      --mdc-typography-subtitle1-font-size: 1.5em;
      padding: 12px;
    }
    [profile] {
      /* min-height: 300px; */
      padding: 2em 0;
      border: 1px solid var(--theme-fg-3);
      transition: opacity 100ms;
    }
    tenant-icon {
      width: 128px;
      height: 128px;
    }
  </style>

  <div flex center rows xxen:style="{{style}}">

    <h2>Welcome!</h2>

    <div flex rows xxen:style="{{opacity}}">

      <mwc-textfield helper="Persona" helperPersistent outline value="{{persona}}" on-change="onPersonaChange"></mwc-textfield>

      <div profile rows center>
        <tenant-icon avatar="{{photoURL}}"></tenant-icon>
        <br><br>
        <b>{{displayName}}</b>
        <i>{{email}}</i>
      </div>

      <div toolbar>
        <!-- <mwc-button raised on-click="onLoginClick">{{loginLabel}}</mwc-button> -->
        <!-- <span style="width: 24px;"></span>
        <mwc-button on-click="onLogoutClick" disabled="{{logoutDisabled}}">Logout</mwc-button> -->
      </div>

      <div style="padding: 6em;"></div>
    </div>

  </div>

    `
  });
