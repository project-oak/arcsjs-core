/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App, logFactory, LocalStoragePersistor, LobbyService, deepQuerySelector} from './arcs.js';
import {FramerRecipe} from './Library/FramerRecipe.js';

const log = logFactory(true, 'LobbyApp', 'navy');

export const LobbyApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {LobbyService};
    this.userAssembly = [FramerRecipe];
    log('Hello');
  }
  async spinup(persona, group) {
    await super.spinup();
    this.arcs.set('user', 'group', group);
    this.arcs.set('user', 'persona', persona);
  }
  get canvas() {
    const camera = deepQuerySelector(document.body, '#camera');
    return camera && deepQuerySelector(camera, 'canvas');
  }
};
