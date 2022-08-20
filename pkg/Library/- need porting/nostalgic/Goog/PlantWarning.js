/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
update({plantInfo}, {}, {output}) {
  if (plantInfo) {
    const {name, isPoisonous} = plantInfo;
    if (isPoisonous) {
      output({textForSpeech: `Warning: the ${name} plant is poisonous`});
    }
  }
}
});
