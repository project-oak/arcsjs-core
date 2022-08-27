/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import * as tryst from '../Firebase/tryst.js';
import {Myself} from './Myself.js';
import {Resources} from '../App/Resources.js';

const Lobby = class {
  constructor() {
    this.allStreams = [];
    this.streams = [];
    this.myself = new Myself();
  }
  async meetStrangers(group, persona, returnStream) {
    await this.myself.ready;
    this.myself.name = persona;
    this.myself.mediaStream = Resources.get(returnStream);
    this.myself.onstream = this.onstream.bind(this);
    //console.log(persona, returnStream);
    const {peerId} = this.myself;
    if (peerId) {
      // be present at the meeting place
      await tryst.meetStrangers(group || 'universal', persona, {persona, peerId});
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
      Resources.set(this.streamId, stream);
      // remember this stream when asked
      const info = {stream: this.streamId, meta: {name: meta.id, ...meta}};
      this.streams.push(info);
      // what we found
      console.log(info);
    }
  }
};

export const LobbyService = {
  createLobby() {
    return Resources.allocate(new Lobby());
  },
  async meetStrangers({lobby, group, persona, returnStream}) {
    return Resources.get(lobby)?.meetStrangers(group, persona, returnStream);
  }
};