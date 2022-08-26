/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import * as tryst from '../Firebase/tryst.js';
import {Myself} from './Meself.js';

const getResource = id => globalThis.resources?.[id];
const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);
const newId = () => Math.floor(Math.random()*1e3 + 9e2);
const freeResource = id => globalThis.resources[id] = null;

const Lobby = class {
  constructor(aeon) {
    this.allStreams = [];
    this.streams = [];
    this.aeon = aeon || 'universal';
    this.myself = new Myself();
  }
  async meetStrangers(persona, returnStream) {
    await this.myself.ready;
    this.myself.name = persona;
    this.myself.mediaStream = getResource(returnStream);
    this.myself.onstream = this.onstream.bind(this);
    //console.log(persona, returnStream);
    const {peerId} = this.myself;
    if (peerId) {
      // be present at the meeting place
      await tryst.meetStrangers(this.aeon, persona, {persona, nid: peerId});
      // these are the streams we captured since last time
      const {streams} = this;
      // start fresh
      this.streams = [];
      // collect all the streams
      this.allStreams = [...this.allStreams, ...streams];
      // try some callbacks
      this.allStreams.forEach(stream => this.maybeTryBack(stream));
      // return the streams
      return streams;
    }
  }
  maybeTryBack(stream) {
    const them = stream?.meta?.call;
    //console.log('maybeTryBack', them);
    if (this.myself.shouldCall(them)) {
      console.log('CALLING', them);
      this.myself.doCall(them);
    }
  }
  onstream(stream, meta) {
    if (stream && meta.id) {
      // create a resource id for this stream
      this.streamId = `${meta.id}-lobby-stream`;
      // stash our stream there
      setResource(this.streamId, stream);
      // remember this stream when asked
      const info = {stream: this.streamId, meta: {name: meta.id, ...meta}};
      this.streams.push(info);
      // what we found
      console.log(info);
    }
  }
};

export const LobbyService = {
  createLobby(aeon) {
    const id = newId();
    setResource(id, new Lobby(aeon));
    return id;
  },
  async meetStrangers({lobby, persona, returnStream}) {
    const realLobby = getResource(lobby);
    return realLobby?.meetStrangers(lobby, persona, returnStream);
  }
};