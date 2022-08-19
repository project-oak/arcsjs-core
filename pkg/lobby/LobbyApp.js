/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../Library/App/Worker/WorkerApp.js';
import {makeName} from '../core/utils.min.js';
import '../Library/App/surface-imports.js';
import {meetStrangers} from '../Library/Firebase/tryst.js';
import {DeviceUxRecipe} from '../Library/Media/DeviceUxRecipe.js';
import {LobbyRecipe} from './Library/LobbyRecipe.js';

export const LobbyApp = class extends App {
  constructor(paths) {
    super(paths);
    this.userAssembly = [DeviceUxRecipe, LobbyRecipe];
  }
  async spinup() {
    await super.spinup();
    this.persona = makeName();
    this.Arcs.set('user', 'persona', this.persona);
    this.Arcs.watch('user', 'callees', callees => this.calleesChanged(callees));
    await this.enableMedia();
    this.createTvParticle(this.persona, 'lobby#tv', this.persona);
    this.meet();
  }
  async meet() {
    if (!this.closed) {
      setTimeout(() => this.meet(), 500);
      const strangers = await meetStrangers(this.persona);
      this.Arcs.set('user', 'strangers', strangers);
    }
  }
  calleesChanged(callees) {
    log(callees);
  }
  createTvParticle(name, container, stream) {
    const meta = {kind: '$app/Library/Tv', container, staticInputs: {stream}};
    this.Arcs.createParticle(name, 'user', meta);
  }
};
