/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {GoogleLogin} from './google-login.js';

let firebase;

export const awaitLoginChange = async (_firebase, onLogin) => {
  firebase = _firebase;
  // wait for a Google Login
  GoogleLogin.enable(_firebase, login => {
    // setTimeout() to get us off the Firebase call stack
    setTimeout(() => onLogin(auth, login), 100);
  });
};

const auth = {
  signOut() {
    GoogleLogin.signOut(firebase);
  },
  signInAnonymously() {
    GoogleLogin.signInAnonymously(firebase);
  },
  signInPopup() {
    GoogleLogin.signInPopup(firebase);
  },
  signInRedirect() {
    GoogleLogin.signInWithRedirect(firebase);
  }
};
