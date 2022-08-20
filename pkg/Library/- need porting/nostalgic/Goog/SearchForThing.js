/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

update({query, searchUrl}) {
  if (query && searchUrl) {
    const matches = query.toLowerCase().match(/search for (.*)/);
    if (matches?.length) {
      return {url: `${searchUrl}${matches[1]}`};
    }
  }
}

});
