/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update(inputs, state, {service, output}) {
  if (this.canRunMacro(inputs) && this.inputsChanged(inputs, state)) {
    assign(state, {...inputs});
    output({results: null});
    const response = await this.runMacro(inputs, service);
    return {
      results: this.formatResponse(response)
    };
  }
},

canRunMacro({macroId, nameKey}) {
  return macroId && nameKey;
},

inputsChanged({macroId, nameKey, params}, state) {
  return (macroId !== state.macroId)
      || (nameKey !== state.nameKey)
      || !deepEqual(params, state.params);
},

async runMacro({macroId, nameKey, params}, service) {
  const data = {macroId, inputs: {[nameKey]: params}};
  return service({kind: 'GoogleApisService', msg: 'runMacro', data});
},

formatResponse(response) {
  return response?.messages?.[0].text?.split('\n')?.[0]?.trim().toLowerCase() ?? `didn't work, sorry`;
}

});
