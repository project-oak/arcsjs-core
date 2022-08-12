import {App} from '../Library/App/Worker/WorkerApp.js';
import {LobbyRecipe} from './LobbyRecipe.js';
import {myself as my} from '../Library/Rtc/myself.js';
import {makeName} from '../../core/core/utils.min.js';

export const LobbyApp = class extends App {
  constructor(paths) {
    super(paths);
    this.userAssembly = [LobbyRecipe];
  }
  async spinup() {
    await super.spinup();
    //const persona = this.user.stores.persona;
    const persona = makeName();
    this.Arcs.set('user', 'persona', persona);
    // name goes in the metadata
    my.metadata = persona.data;
  }
};
