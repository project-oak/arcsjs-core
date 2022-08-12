import '../Library/App/surface-imports.js';
import {makeName} from '../core/utils.min.js';
import {App} from '../Library/App/Worker/WorkerApp.js';
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
    await this.enableMedia();
    this.persona = makeName();
    this.Arcs.set('user', 'persona', this.persona);
    this.meet();
    this.createTvParticle(this.persona, 'lobby#tv', this.persona);
  }
  async meet() {
    if (!this.closed) {
      this.Arcs.set('user', 'strangers', await meetStrangers(this.persona));
      setTimeout(() => this.meet(), 500);
    }
  }
  createTvParticle(name, container, stream) {
    const meta = {kind: '$app/Library/Tv', container, staticInputs: {stream}};
    this.Arcs.createParticle(name, 'user', meta);
  }
};
