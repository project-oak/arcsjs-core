/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({query}, state) {
  if (query && !state.query !== query) {
    state.query = query;
    const url = `https://pixabay.com/api/?key=31270274-5e18e915d977d3ca8d456a34c&image_type=photo&q=`;
    const response = await fetch(`${url}${query}`, {
      method: 'GET'
    });
    const json = await response.json();
    log(json);
    const imageUrl = json?.hits?.[0]?.largeImageURL;
    if (imageUrl) {
      return {image: {url: imageUrl}};
    }
  }
}

})
