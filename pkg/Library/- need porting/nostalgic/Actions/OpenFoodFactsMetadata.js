/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

  shouldUpdate({classifierResults}) {
    return Boolean(classifierResults);
  },

  async update({classifierResults}, state) {
    const output = {metadataResults: {}};
    if (classifierResults?.[0] && classifierResults !== state.lastClassifierResults) {
      state.lastClassifierResults = classifierResults;
      assign(output, await this.query(classifierResults));
    }
    return output;
  },

  async query(classifierResults) {
    const barcode = classifierResults?.[0]?.displayName;
    if (typeof barcode === 'string') {
      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      const response = await utils.fetch(url);
      const metadataResults = await response.json();
      return {metadataResults};
    }
  }

})
