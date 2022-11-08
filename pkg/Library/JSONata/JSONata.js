/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.evaluate = data => service({kind: 'JSONataService', msg: 'evaluate', data})
},
shouldUpdate({json, expression}) {
  return Boolean(json && expression);
},
async update({json, expression}, {evaluate}) {
  if (typeof json === 'string') {
    json = JSON.parse(json);
  }
  const result = await evaluate({json, expression});
  return result;
}
});
