/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
update({transcript, phrase}) {
  const text = transcript?.transcript?.toLowerCase();
  if (phrase && text?.includes(phrase)) {
    const epsilon = Math.random() / 1000;
    return {
      transcript: null,
      boxSelection: {xCenter: 0.5 + epsilon, yCenter: 0.5, width: 0.5, height: 0.5}
    };
  }
}
});
