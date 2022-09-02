/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({entityInfo}, state, {output, service, invalidate}) {
  if (state.plantName !== entityInfo?.name) {
    state.plantName = entityInfo?.name;
    if (entityInfo?.name) {
      state.isPoisonous = '[considering...]';
      // non-trivial asynchrony :)
      this.updateIsPoisonous(entityInfo, state, {service, invalidate});
    }
  }
  const response = state.response;
  if (response) {
    // consume response
    state.response = null;
    // calculate output
    const isPoisonous = this.isPoisonous(response);
    log(entityInfo, isPoisonous);
    state.isPoisonous = isPoisonous;
    return {isPoisonous};
  }
},

async updateIsPoisonous(entityInfo, state, {service, invalidate}) {
  const isPoisonousMacro = 'NvfwycdHBRpq4h13rEj2';
  const nameKey = '6f3a583b-1f7c-4e19-af80-eb9ddf374688';
  state.response = await this.runMacro(isPoisonousMacro, {[nameKey]: entityInfo?.name}, service);
  invalidate();
},

isPoisonous(response) {
  const answer = response?.messages?.[0].text?.split('\n')[0]?.trim().toLowerCase() ?? `didn't work, sorry`;
  return answer === 'yes';
},

async runMacro(macroId, inputs, service) {
  const data = {macroId, inputs};
  return await service({kind: 'GoogleApisService', msg: 'runMacro', data});
},

render({entityInfo: {name}}, {isPoisonous}) {
  return {
    name,
    isPoisonous
  };
},

template: html`
<div>
  "<span>{{name}}</span>" is poisonous/venomous: <span>{{isPoisonous}}</span>
</div>
`

});
