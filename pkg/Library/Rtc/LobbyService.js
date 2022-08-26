/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {meetStrangers} from '../Firebase/tryst.js';
import {myself} from './myself.js';

const getResource = id => globalThis.resources?.[id];
const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);
const freeResource = id => globalThis.resources[id] = null;
const newId = () => Math.floor(Math.random()*1e3 + 9e2);

const Lobby = class {
  constructor() {
    this.allStreams = [];
    this.streams = [];
  }
  async meetStrangers(persona, returnStream) {
    //console.log(persona, returnStream);
    if (!myself.nid) {
      await this.start(persona);
    }
    myself.mediaStream = getResource(returnStream);
    const {name, nid} = myself;
    if (nid) {
      // be present at the meeting place
      await meetStrangers(name, {name, nid});
      // these are the streams we captured since last time
      const {streams} = this;
      // start fresh
      this.streams = [];
      // collect all the streams
      this.allStreams = [...this.allStreams, ...streams];
      // try some callbacks
      this.allStreams.forEach(s => this.maybeTryBack(s));
      // return the streams
      return streams;
    }
  }
  maybeTryBack(stream) {
    const them = stream?.meta?.call;
    //console.log('maybeTryBack', them);
    if (myself.shouldCall(them)) {
      console.log('CALLING', them);
      myself.doCall(them);
    }
  }
  async start(persona) {
    // TODO(sjmiles): um 1:n?
    myself.onstream = this.onstream.bind(this);
    return myself.start(persona);
  }
  onstream(stream, meta) {
    if (stream && meta.id) {
      // create a resource id for this stream
      this.streamId = `lobbyStream-${meta.id}`;
      // stash our stream there
      setResource(this.streamId, stream);
      // remember this stream when asked
      const info = {stream: this.streamId, meta: {name: meta.id, ...meta}};
      this.streams.push(info);
      // what we found
      console.log(info);
      // if (myself.shouldCall(meta.call)) {
      //   console.log('CALLING', meta.call);
      //   myself.doCall(meta.call);
      // }
    }
  }
};

export const LobbyService = {
  createLobby() {
    const lobbyId = newId();
    const lobby = new Lobby();
    setResource(lobbyId, lobby);
    return lobbyId;
  },
  async meetStrangers({lobby, persona, returnStream}) {
    const realLobby = getResource(lobby);
    return realLobby?.meetStrangers(persona, returnStream);
  }
};