/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global scope */
({
  async initialize({}, state, {service}) {
    state.lobby = await service({kind: 'LobbyService', msg: 'createLobby'});
  },
  async update({stream, profile, persona, returnStream}, state, {service, invalidate}) {
    //log(profile);
    state.persona = persona ?? profile?.displayName ?? state.persona ?? await service({kind: 'App', msg: 'MakeName'});
    if (state.persona) {
      scope.timeout(invalidate, 3*1e3);
    }
    state.streams = await this.updateStreams({returnStream}, state, {service});
    const lastStream = state?.streams[state.streams?.length-1]?.stream;
    if (lastStream !== stream) {
      return {
        stream: lastStream
      };
    }
  },
  async updateStreams({returnStream}, {streams, lobby, persona}, {service}) {
    const newStreams = await service({kind: 'LobbyService', msg: 'meetStrangers', data: {lobby, persona, returnStream}});
    streams = [
      ...(streams || []),
      ...(newStreams || [])
    ];
    return streams;
  },
  render(inputs, {persona, streams}) {
    const tvs = values(streams || {}).map(({stream, meta: {name}}) => ({stream, name})).reverse();
    return {
      name: persona,
      tvs
    };
  },
  onCloseClick({eventlet: {key}}, state) {
    const index = state.streams.findIndex(s => s?.meta?.name === key);
    if (index >= 0) {
      state.streams.splice(index, 1);
    }
  },
  template: html`
<style>
  :host {
    padding: 8px;
    background: gray;
    color: #eee;
  }
  hr {
    width: 100%;
  }
  [label2] {
    font-size: 0.8em;
  }
  [strangers] {
    padding: 4px;
    font-family: "Google Sans", sans-serif;
  }
  [stream] {
    width: 80px;
    margin: 4px;
  }
  [name] {
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<div>
  <span>{{name}}</span>'s Lobby
</div>
<hr>
<div label2>Users in Lobby:</div>
<div tvs flex scrolling row repeat="video_t">{{tvs}}</div>

<template video_t>
  <div stream column>
    <div bar>
      <span name>{{name}}</span>
      <span flex></span>
      <icon key="{{name}}" on-click="onCloseClick">close</icon>
    </div>
    <stream-view flex playsinline muted stream="{{stream}}"></stream-view>
  </div>
</template>
`
});
