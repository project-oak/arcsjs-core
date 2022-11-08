/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update({input}, state, {service}) {
  if (input && input !== state.input) {
    state.input = input;
    log(`MAKING A GRAPH FOR: ${input}`);
    const graph = await service({msg: 'MakeGraph', data: {input}});
    return {graph};
  }
}
});
