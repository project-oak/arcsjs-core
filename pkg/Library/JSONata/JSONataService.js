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

export const JSONataService = {
  evaluate(arc, host, request) {
    return evaluate(request.data) || null;
  }
};

const evaluate = ({json, expression}) => {
  const result = jsonata(expression).evaluate(json);
  return {result};
};
