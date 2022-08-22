/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({plantInfo}, state, {service}) {
  if (plantInfo?.name && state.plantName !== plantInfo.name) {
    state.plantName = plantInfo.name;
    const response = await this.runMacro(service, 'NvfwycdHBRpq4h13rEj2', {
      "6f3a583b-1f7c-4e19-af80-eb9ddf374688": plantInfo?.name
    });
    return {plantInfo: {...plantInfo, isPoisonous: this.isPoisonous(response)}};
  } else {
    state.plantName = null;
  }
},
isPoisonous(response) {
  const answer = response?.messages?.[0].text?.split('\n')[0]?.trim().toLowerCase() ?? `didn't work, sorry`;
  return answer === 'yes';
},
async runMacro(service, macroId, inputs) {
  const data = {macroId, inputs};
  return await service({kind: 'GoogleApisService', msg: 'runMacro', data});
},

});
