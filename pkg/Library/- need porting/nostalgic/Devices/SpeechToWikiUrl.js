/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
update({transcript}) {
  const text = String(transcript?.transcript || '').toLowerCase();
  const matches = text.match(/search for (.*)/);
  if (matches?.length) {
    log(matches);
    return {url: `https://en.wikipedia.org/wiki/${matches[1]}`};
  }
}
});