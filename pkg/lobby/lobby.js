/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './arcs/config.js';
import {Paths, Params} from './arcs/arcs.js';
import {LobbyApp} from './arcs/LobbyApp.js';

const group = Params.getParam('group');
const persona = Params.getParam('user');

try {
  const app = globalThis.app = new LobbyApp(Paths.map);
  await app.spinup(persona, group);
} catch(x) {
  console.error(x);
}

export const canvas = await new Promise(r => setTimeout(() => r(globalThis.app?.canvas), 500));
