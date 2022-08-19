/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App, makeName, subscribeToStream} from '../conf/allowlist.js';
import {ComputeRecipe} from './ComputeRecipe.js';
import {meetStrangers} from '../../Library/Firebase/tryst.js';
import {myself} from '../../Library/Rtc/myself.js';
import {inputVideo, postFx} from '../capture.js';

console.log(globalThis.config);

const streams = globalThis.streams = {};

// App class
export const ComputeApp = class extends App {
  constructor(paths, root, options) {
    super(paths, root);
    this.userAssembly = [ComputeRecipe];
  }
  async spinup() {
    await super.spinup();
    await this.initPersona();
    await this.initRtc();
    await this.initLobby();
  }
  async initPersona() {
    // keep "myself.name" set to "persona"
    //this.arcs.watch('user', 'persona', persona => myself.name = persona);
    // fetch system value for persona
    this.persona = await this.arcs.get('user', 'persona');
    // initialize persona if needed
    if (!this.persona) {
      this.persona = makeName();
      this.arcs.set('user', 'persona', this.persona);
    }
  }
  async initRtc() {
    myself.onstream = this.onstream.bind(this);
    myself.mediaStream = postFx;
    streams.fx = postFx;
    this.arcs.set('user', 'remoteStream', 'fx');
    //subscribeToStream(stream => myself.mediaStream = stream);
    await myself.start(this.persona);
    //this.arcs.watch('user', 'callees', callees => this.calleesChanged(callees));
    //this.createTvParticle(this.persona, 'lobby#tv', this.persona);
  }
  async initLobby() {
    // network id
    const nid = myself.nid; //Math.random();
    this.meet(this.persona, nid, 3000);
  }
  async meet(name, nid, pingIntervalMs) {
    if (!this.closed) {
      setTimeout(() => this.meet(name, nid, pingIntervalMs), pingIntervalMs || 1e5);
      const strangers = await meetStrangers(name, {name, nid}) || {};
      Object.values(strangers).forEach(({name, nid}) => {
        if (myself.shouldCall(nid)) {
          console.log('calling', name);
          myself.doCall(nid, stream => console.log(stream));
        }
      });
      //console.log(strangers);
    }
  }
  onstream(stream, meta) {
    console.log('onstream', meta);
    const id = meta?.id || makeName();
    streams[id] = stream;
    this.createTvParticle(id, '#tvs', id);
    inputVideo.srcObject = stream;
  }
  createTvParticle(name, container, stream) {
    console.log('createTvParticle', name);
    const meta = {kind: '$app/Library/Tv', container, staticInputs: {stream}};
    this.arcs.createParticle(name, 'user', meta);
  }
  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
      case 'closeStream':
        this.closeStream(data);
        break;
      case 'playClick':
        inputVideo.play();
        break;
      default:
        return false;
    }
    return true;
  }
  closeStream(streamId) {
    return this.arcs.destroyParticle(streamId, 'user');
  }
};
