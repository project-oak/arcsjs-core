const {webnative: wn} = window;

export const auth = async go => {
  const state = await wn.initialise({
    permissions: {
      // Will ask the user permission to store
      // your apps data in `private/Apps/<creator>/<name>`
      app: {
        name: "FissionSmoke",
        creator: "ArcsJs"
      },
      // Ask the user permission to additional filesystem paths
      fs: {
        private: [
          wn.path.directory("FissionSmoke", "Private")
        ],
        public: [
          wn.path.directory("FissionSmoke", "Public")
        ]
      }
    }
  }).catch(err => {
    switch (err) {
      case wn.InitialisationError.InsecureContext:
        // We need a secure context to do cryptography
        // Usually this means we need HTTPS or localhost
        break;
      case wn.InitialisationError.UnsupportedBrowser:
        // Browser not supported.
        // Example: Firefox private mode can't use indexedDB.
        break;
      }
      // TODO(sjmiles): do something? state is undefined?
  });
  switch (state?.scenario) {
    case wn.Scenario.AuthCancelled:
      // User was redirected to lobby,
      // but cancelled the authorisation
      break;
    case wn.Scenario.AuthSucceeded:
    case wn.Scenario.Continuation:
      // State:
      // state.authenticated    -  Will always be `true` in these scenarios
      // state.newUser          -  If the user is new to Fission
      // state.throughLobby     -  If the user authenticated through the lobby, or just came back.
      // state.username         -  The user's username.
      //
      // ☞ We can now interact with our file system (more on that later)
      return go({wn, state});
    case wn.Scenario.NotAuthorised:
      wn.redirectToLobby(state.permissions);
      break;
  }
};