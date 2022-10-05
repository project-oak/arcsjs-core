/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import "../../third_party/JSONata/jsonata.min.js";
const {jsonata} = globalThis;

export const JsonataService = async (runtime, host, request) => {
  switch (request.msg) {
    case 'evaulate':
      return evaluate(request.data, runtime) || null;
  }
};

const evaluate = ({storeId, expr}, runtime) => {
  const store = runtime.stores[storeId];
  if (store) {
    const value = jsonata(expr, store.pojo);
    return {storeId, value};
  }
};
