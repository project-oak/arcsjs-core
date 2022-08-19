/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
initialize(inputs, state) {
  state.strangers = {};
},
shouldUpdate({strangers}) {
  return Boolean(strangers);
},
update({strangers}, state) {
  state.strangers = this.mergeStrangers(strangers, state.strangers);
},
onVideoCall({callees, eventlet: {key}}) {
  return {callees: {...callees, [key]: {name: key}}};
},
render({persona, callees}, {strangers}) {
  return {
    name: persona,
    strangers: values(strangers),
    callees: values(callees || Object)
  };
},
// the meeting post gets cleared off from time to time,
// so we want to let a posting live for several generations
// after it stops reporting before removing it locally
mergeStrangers(strangers, live) {
  const generations = 20;
  strangers.forEach(name => {
    if (!live[name]) {
      live[name] = {name: name};
    }
    live[name].age = generations;
  });
  values(live).forEach(stranger => {
    if (stranger && --stranger.age === 0) {
      delete live[stranger.name];
    }
  });
  return live;
},
template: html`
<style>
  :host {
    flex: 3 !important;
  }
  [frame=tv] {
    padding-right: 8px;
  }
  [frame=profile] {
    /* padding: 8px; */
  }
  [lobby] {
    padding: 8px;
    border: 1px solid #eee;
  }
  [peer] {
    user-select: none;
    cursor: pointer;
  }
  h3 {
    margin-top: 0;
  }
</style>
<div flex column>
  <!-- profile editor on top -->
  <div row frame="profile"></div>
  <!-- video comms on bottom -->
  <div flex row lobby>
    <div frame="tv"></div>

    <div flex center>
      <h3><span>{{name}}</span>'s Lobby</h3>
      <hr style="width: 100%;">

      <h4>Other users in lobby:</h4>
      <div repeat="name_t">{{strangers}}</div>
      <hr style="width: 100%;">

      <h4>Invitations sent to:</h4>
      <div repeat="name_t">{{callees}}</div>
    </div>
  </div>
</div>

<template name_t>
  <div peer key="{{name}}" on-dblclick="onVideoCall">{{name}}</div>
</template>
`});
