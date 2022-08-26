/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App, makeName, subscribeToDefaultStream} from '../conf/allowlist.js';
import {RemoteRecipe} from './RemoteRecipe.js';
import {meetStrangers} from '../../Library/Firebase/tryst.js';
import {Myself} from '../../Library/Rtc/Meself.js';

console.log(globalThis.config);

//const streams = globalThis.streams = {};

//const getResource = id => globalThis.resources?.[id];
const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);
//const freeResource = id => globalThis.resources[id] = null;
//const newId = () => Math.floor(Math.random()*1e3 + 9e2);

// App class
export const RemoteApp = class extends App {
  constructor(paths, root, options) {
    super(paths, root);
    this.userAssembly = [RemoteRecipe];
  }
  async spinup() {
    await super.spinup();
    await this.initPersona();
    await this.initRtc();
    await this.initLobby();
  }
  async initPersona() {
    // keep "persona" up to date
    this.arcs.watch('user', 'persona', persona => this.persona = persona);
    // fetch system value for persona
    this.persona = await this.arcs.get('user', 'persona');
    // initialize persona if needed
    if (!this.persona) {
      this.persona = makeName();
      this.arcs.set('user', 'persona', this.persona);
    }
  }
  async initRtc() {
    this.myself = new Myself();
    this.myself.onstream = this.onstream.bind(this);
    subscribeToDefaultStream(stream => this.myself.mediaStream = stream);
    await this.myself.ready;
  }
  async initLobby() {
    // network id
    const nid = this.myself.peerId;
    this.meet(this.persona, nid, 3000);
  }
  async meet(name, nid, pingIntervalMs) {
    if (!this.closed) {
      setTimeout(() => this.meet(name, nid, pingIntervalMs), pingIntervalMs || 1e5);
      this.myself.name = this.persona;
      const strangers = await meetStrangers(name, {name, nid}) || {};
      Object.values(strangers).forEach(({name, nid}) => {
        if (this.myself.shouldCall(nid)) {
          console.log('CALLING', name);
          this.myself.doCall(nid);
        }
      });
      //console.log(strangers);
    }
  }
  onstream(stream, meta) {
    console.log('onstream', meta);
    const id = meta?.id || makeName();
    setResource(id, stream);
    this.arcs.set('user', 'remoteStream', id);
  }
  createTvParticle(name, container, stream) {
    const meta = {kind: '$library/Media/InputCamera', container, staticInputs: {stream}};
    this.arcs.createParticle(name, 'user', meta);
  }
};
