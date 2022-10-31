/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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
