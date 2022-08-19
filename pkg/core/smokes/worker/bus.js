/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Bus = {
  init() {
    onmessage = e => this.onmessage(e);
  },
  async onmessage(e) {
    try {
      //const msg = JSON.parse(e.data);
      globalThis.handleMessage(e.data, e);
    } catch(x) {
      console.error(x);
      this.postMessage('oh dear');
    }
  }
};
