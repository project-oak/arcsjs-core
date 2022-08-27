/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {
  App, makeName, subscribeToStream,
  tryst, Resources, Myself
} from '../conf/allowlist.js';
import {RemoteRecipe} from './RemoteRecipe.js';

// App class
export const RemoteApp = class extends App {
  constructor(paths, root, options) {
    super(paths, root);
    this.userAssembly = [RemoteRecipe];
  }
  async spinup() {
    await super.spinup();
    await this.initRtc();
    await this.initPersona();
    await this.initLobby();
    await this.runLobby();
  }
  async initPersona() {
  //   // keep "persona" up to date
  //   this.arcs.watch('user', 'persona', persona => this.persona = persona);
  //   // fetch system value for persona
  //   this.persona = await this.arcs.get('user', 'persona');
  //   // initialize persona if needed
  //   if (!this.persona) {
    this.persona = makeName();
    this.arcs.set('user', 'persona', this.persona);
  //   }
  }
  async initRtc() {
    this.myself = new Myself();
    this.myself.onstream = this.onstream.bind(this);
    subscribeToStream('default', stream => this.myself.mediaStream = stream);
    await this.myself.ready;
  }
  async initLobby() {
    this.group = 'frankencense';
    this.arcs.set('user', 'group', this.group);
}
  async runLobby() {
    this.meet(this.persona, this.myself.peerId, 3000);
  }
  async meet(name, peerId, pingIntervalMs) {
    if (!this.closed) {
      setTimeout(() => this.runLobby(), pingIntervalMs || 1e5);
      this.myself.name = this.persona;
      const strangers = await tryst.meetStrangers(this.group, name, {persona: name, peerId}) || {};
      Object.values(strangers).forEach(({persona, peerId}) => {
        if (this.myself.shouldCall(peerId)) {
          console.log('CALLING', persona);
          this.myself.doCall(peerId);
        }
      });
    }
  }
  onstream(stream, meta) {
    console.log('onstream', meta);
    const id = meta?.id || makeName();
    Resources.set(id, stream);
    this.arcs.set('user', 'remoteStream', id);
  }
  createTvParticle(name, container, stream) {
    const meta = {kind: '$library/Media/InputCamera', container, staticInputs: {stream}};
    this.arcs.createParticle(name, 'user', meta);
  }
};
