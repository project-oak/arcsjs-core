/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

 export const GoogleLogin = {
  async enable(Firebase, onchange) {
    // react to auth activity
    Firebase.app.auth().onAuthStateChanged(
      user => user
        ? this.onSignedIn(onchange, Firebase, user)
        : this.onSignedOut(onchange, Firebase)
    );
  },
  async disable(Firebase) {
    this.signOut(Firebase);
  },
  onSignedIn(onchange, Firebase, user) {
    onchange(user, Firebase);
  },
  /**
   * supplied onchange should proably do one of these:
   *   GoogleLogin::signInPopup(Firebase);
   *   GoogleLogin::signInWithRedirect(Firebase);
   */
  onSignedOut(onchange, Firebase) {
    onchange(null, Firebase);
  },
  async signOut(Firebase) {
    return Firebase.app.auth().signOut();
  },
  async signInAnonymously(Firebase) {
    return Firebase.app.auth().signInAnonymously(Firebase.app.auth());
  },
  async signInWithRedirect(Firebase) {
    return await Firebase.app.auth().signInWithRedirect(GoogleLogin.getProvider(Firebase));
  },
  async signInPopup(Firebase) {
    return await Firebase.app.auth().signInWithPopup(GoogleLogin.getProvider(Firebase));
  },
  getProvider(Firebase) {
    const provider = new Firebase.auth.GoogleAuthProvider();
    //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // provider.setCustomParameters({
    //   //'login_hint': 'user@example.com',
    //   prompt: 'none' //'select_account'
    // });
    return provider;
  }
};

// function googleSignInRedirectResult() {
//   firebase.auth()
//     .getRedirectResult()
//     .then((result) => {
//       if (result.credential) {
//         /** @type {firebase.auth.OAuthCredential} */
//         var credential = result.credential;

//         // This gives you a Google Access Token. You can use it to access the Google API.
//         var token = credential.accessToken;
//         // ...
//       }
//       // The signed-in user info.
//       var user = result.user;
//     }).catch((error) => {
//       // Handle Errors here.
//       var errorCode = error.code;
//       var errorMessage = error.message;
//       // The email of the user's account used.
//       var email = error.email;
//       // The firebase.auth.AuthCredential type that was used.
//       var credential = error.credential;
//       // ...
//     });
// }

// function googleBuildAndSignIn(id_token) {
//   // Build Firebase credential with the Google ID token.
//   var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

//   // Sign in with credential from the Google user.
//   firebase.auth().signInWithCredential(credential).catch((error) => {
//     // Handle Errors here.
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     // The email of the user's account used.
//     var email = error.email;
//     // The firebase.auth.AuthCredential type that was used.
//     var credential = error.credential;
//     // ...
//   });
// }

// function onSignIn(googleUser) {
//   console.log('Google Auth Response', googleUser);
//   // We need to register an Observer on Firebase Auth to make sure auth is initialized.
//   var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
//     unsubscribe();
//     // Check if we are already signed-in Firebase with the correct user.
//     if (!isUserEqual(googleUser, firebaseUser)) {
//       // Build Firebase credential with the Google ID token.
//       var credential = firebase.auth.GoogleAuthProvider.credential(
//           googleUser.getAuthResponse().id_token);

//       // Sign in with credential from the Google user.
//       // [START auth_google_signin_credential]
//       firebase.auth().signInWithCredential(credential).catch((error) => {
//         // Handle Errors here.
//         var errorCode = error.code;
//         var errorMessage = error.message;
//         // The email of the user's account used.
//         var email = error.email;
//         // The firebase.auth.AuthCredential type that was used.
//         var credential = error.credential;
//         // ...
//       });
//       // [END auth_google_signin_credential]
//     } else {
//       console.log('User already signed-in Firebase.');
//     }
//   });
// }

// function isUserEqual(googleUser, firebaseUser) {
//   if (firebaseUser) {
//     var providerData = firebaseUser.providerData;
//     for (var i = 0; i < providerData.length; i++) {
//       if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
//           providerData[i].uid === googleUser.getBasicProfile().getId()) {
//         // We don't need to reauth the Firebase connection.
//         return true;
//       }
//     }
//   }
//   return false;
// }
