/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({classifierResults}, state) {
  if (classifierResults?.[0]) {
    const text = classifierResults[0].displayName?.trim();
    if (state.lastText !== text) {
      state.lastText = text;
      if (text?.length > 0 && text !== 'None') {
        return {text: `search for ${text}`, info: {name: text}};
      } else {
        return {text: null, info: null};
      }
    }
  }
}

});
