/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({transcript}, state) {
  const text = transcript?.interimTranscript || transcript?.transcript;
  if (state.text != text) {
    assign(state, {text});
    return {text};
  }
}

});
