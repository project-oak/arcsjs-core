/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../Library/App/Worker/App.js';
import {DeviceUxRecipe} from '../Library/Media/DeviceUxRecipe.js';
import {LobbyRecipe} from './Library/LobbyRecipe.js';
import {meetStrangers} from '../Library/Firebase/tryst.js';
import {myself} from '../Library/Rtc/myself.js';
import {subscribeToStream} from '../Library/App/surface-imports.js';
import {LocalStoragePersistor} from '../Library/LocalStorage/LocalStoragePersistor.js';
import {makeName, logFactory} from '../core/utils.min.js';

const log = logFactory(true, 'LobbyApp', 'navy');

//const keys = o => o ? Object.keys(o) : [];

const streams = globalThis.streams = {};

export const LobbyApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.userAssembly = [DeviceUxRecipe, LobbyRecipe];
  }
  async spinup() {
    subscribeToStream(stream => myself.mediaStream = stream);
    await super.spinup();
    this.enableMedia();
    await this.initPersona();
    this.initRtc();
  }
  async initPersona() {
    // keep "myself.name" set to "persona"
    this.arcs.watch('user', 'persona', persona => myself.name = persona);
    // fetch system value for persona
    this.persona = await this.arcs.get('user', 'persona');
    // initialize persona if needed
    if (!this.persona) {
      this.persona = makeName();
      this.arcs.set('user', 'persona', this.persona);
    }
  }
  initRtc() {
    this.arcs.watch('user', 'callees', callees => this.calleesChanged(callees));
    this.createTvParticle(this.persona, 'lobby#tv', this.persona);
    myself.start(this.persona);
    myself.onstream = this.onstream.bind(this);
    this.meet();
  }
  async meet() {
    if (!this.closed) {
      // meeting strangers is a separate subsystem from RTC
      setTimeout(() => this.meet(), 3000);
      const name = this.persona;
      const strangers = await meetStrangers(name, {name, nid: myself.nid}) || {};
      //log(strangers);
      // const callees = keys(this.callees);
      // const fresh = strangers?.filter(name => !callees.includes(name));
      const fresh = strangers;
      this.arcs.set('user', 'strangers', fresh);
    }
  }
  calleesChanged(callees) {
    log(callees);
    this.callees = callees;
    for (const them of Object.values(callees)) {
      console.log('shouldCall', them.nid, myself.shouldCall(them.nid));
      if (myself.shouldCall(them.nid)) {
        myself.doCall(them.nid);
      }
    }
  }
  onstream(stream, meta) {
    log('onstream', meta);
    const id = meta?.id || makeName();
    streams[id] = stream;
    this.createTvParticle(id, 'root', id);
  }
  createTvParticle(name, container, stream) {
    const meta = {kind: '$app/Library/Tv', container, staticInputs: {stream}};
    this.arcs.createParticle(name, 'user', meta);
  }
};
