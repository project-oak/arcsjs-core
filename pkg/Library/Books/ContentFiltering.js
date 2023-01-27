/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldUpdate({pages}) {
  return pages;
},
update({pages, denylist}, state) {
  if (pages) {
    pages.forEach(page => page.safeContent = this.isLegitFrame(page.text, denylist));
    return {pages};
  }
},
isLegitFrame(text, denylist) {
  return denylist?.every(word => !text.toLowerCase().includes(word.toLowerCase()));
}
});
