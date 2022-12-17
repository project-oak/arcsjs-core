/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../../Library/App/Worker/App.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
import {HistoryService} from '../../Library/App/HistoryService.js';
import {MediaService} from '../../Library/NewMedia/MediaService.js';
import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
import {FaceMeshService} from '../../Library/Mediapipe/FaceMeshService.js';
import {SelfieSegmentationService} from '../../Library/Mediapipe/SelfieSegmentationService.js';
import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';
import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
import {CocoSsdService} from '../../Library/TensorFlow/CocoSsdService.js';
import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {NodegraphRecipe} from './NodegraphRecipe.js';
import {logFactory} from '../../Library/Core/utils.min.js';

const log = logFactory(true, 'Nodegraph', 'navy');

// App class
export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {
      HistoryService,
      MediaService,
      ThreejsService,
      ShaderService,
      FaceMeshService,
      SelfieSegmentationService,
      TensorFlowService,
      CocoSsdService,
      GoogleApisService
    };
    this.recipes = [NodegraphRecipe];
    log('Welcome!');
  }
  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
      case 'addParticle':
        return this.addParticle(runtime, host, data);
      case 'destroyParticle':
        return this.destroyParticle(runtime, host, data);
      case 'updateParticle':
        return this.updateParticle(runtime, host, data);
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
  async updateParticle(runtime, host, {kind, code}) {
    this.arcs.updateParticle(kind, code, 'user');
    return true;
  }
};
