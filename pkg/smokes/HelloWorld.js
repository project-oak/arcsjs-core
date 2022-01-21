/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
  shouldUpdate({things}) {
    return Boolean(things);
  },
  update({things}, state, {invalidate}) {
    if (things.empty) {
      things.assign({
        counter: 0,
        objects: 0,
        stuff: 0
      });
    }
    log(things);
    const counter = things.getByIndex(0);
    if (counter < 9) {
      things.setByIndex(0, counter + 1);
      things.stuff = things.stuff + 1;
      things.objects++;
      timeout(() => invalidate(), 0);
    }
    return({things});
  }
});
