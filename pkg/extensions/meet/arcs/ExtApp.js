/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {
  Paths, App, LocalStoragePersistor,
  HistoryService,
  ThreejsService,
  ShaderService,
  TensorFlowService,
  SelfieSegmentationService,
  MediaService
} from './arcs.js';
import {ExtRecipe} from './ExtRecipe.js';

export const ExtApp = class extends App {
  constructor() {
    super(Paths.map);
    this.services = {HistoryService, ThreejsService, ShaderService, TensorFlowService, SelfieSegmentationService, MediaService};
    this.userAssembly = [ExtRecipe];
    this.persistor = new LocalStoragePersistor('user');
  }
  async spinup() {
    //this.root = null;
    await super.spinup();
    this.arcs.set('user', 'mediaDeviceState', {isCameraEnabled: true});
  }
};
