/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../../Library/App/Worker/App.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
import {HistoryService} from '../../Library/App/HistoryService.js';
import {MediaService} from '../../Library/NewMedia/MediaService.js';
import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
import {MediapipeService} from '../../Library/Mediapipe/MediapipeService.js';
import {NodegraphRecipe} from './NodegraphRecipe.js';
import {logFactory} from '../../Library/Core/utils.min.js';
import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';

const log = logFactory(true, 'Nodegraph', 'navy');

// App class
export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {HistoryService, MediaService, GoogleApisService, MediapipeService, TensorFlowService, ShaderService, ThreejsService},
    this.userAssembly = [NodegraphRecipe];
    log('Welcome!');
  }

  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
      case 'addParticle':
        return this.addParticle(runtime, host, data);
      case 'destroyParticle':
        return this.destroyParticle(runtime, host, data);
    }
  }
  async addParticle(runtime, host, {name, meta, code}) {
    this.arcs.createParticle(name, 'user', meta, code);
    return true;
  }
  async destroyParticle(runtime, host, {name}) {
    this.arcs.destroyParticle(name, 'user');
    return true;
  }
};
