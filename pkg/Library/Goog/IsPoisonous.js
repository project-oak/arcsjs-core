/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update({entityName}, state, {service, invalidate}) {
  if (state.plantName !== entityName) {
    state.plantName = entityName;
    if (state.plantName) {
      state.isPoisonous = null;
      // non-trivial asynchrony :)
      this.updateIsPoisonous(state, {service, invalidate});
    }
  }
  const response = state.response;
  if (response) {
    // consume response
    state.response = null;
    // calculate output
    const isPoisonous = this.isPoisonous(response);
    log(state.plantName, isPoisonous);
    state.isPoisonous = isPoisonous;
    return {isPoisonous};
  }
},

async updateIsPoisonous(state, {service, invalidate}) {
  const isPoisonousMacro = 'NvfwycdHBRpq4h13rEj2';
  const nameKey = '6f3a583b-1f7c-4e19-af80-eb9ddf374688';
  state.response = await this.runMacro(isPoisonousMacro, {
    [nameKey]: state.plantName
  },
  service);
  invalidate();
},

isPoisonous(response) {
  const answer = response?.messages?.[0].text?.split('\n')[0]?.trim().toLowerCase() ?? `didn't work, sorry`;
  return answer === 'yes';
},

async runMacro(macroId, inputs, service) {
  const data = {macroId, inputs};
  return service({kind: 'GoogleApisService', msg: 'runMacro', data});
},

render({entityName}, {isPoisonous}) {
  const q = `Is "${entityName}" poisonous?`;
  const a = isPoisonous === null
    ? '[considering...]'
    : isPoisonous
    ? `may indeed be poisonous (or venomous), be advised.`
    : `might be safe, but I can make mistakes!`
    ;
  return {
    noEntity: !entityName,
    brain: resolve('$library/Goog/assets/brain.png'),
    entityName,
    query: q,
    name: isPoisonous === null ? '' : 'It ', //`"${entityName}" `,
    text : a,
    isPoisonous
  };
},

template: html`
<style>
  img {
    margin: 0 8px;
    font-size: 0.8em;
  }
  [result] {
    color: darkgreen;
    font-weight: bold;
  }
  [poison-y] {
    color: crimson;
  }
  [row] [row] {
    padding: 4px;
  }
</style>
<div flex row centering>

  <img src="{{brain}}">

  <div hidden="{{noEntity}}" flex center column>

    <div row>
      <span>Is "</span>
      <b>{{entityName}}</b>
      <span>" poisonous?</span>
    </div>

    <div row>
      <span>{{name}}</span>&nbsp;
      <span result poison-y$="{{isPoisonous}}">{{text}}</span>
    </div>

  </div>
</div>
`
});
