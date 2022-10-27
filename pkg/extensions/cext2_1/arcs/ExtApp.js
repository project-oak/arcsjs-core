/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import * as Arcs from './arcs.js';
import {ExtRecipe} from './ExtRecipe.js';

//globalThis.Resources = Resources;

export const ExtApp = class extends Arcs.App {
  constructor() {
    super(Arcs.Paths.map);
    this.root = null;
    this.services = [
      // Arcs.AudioService,
      // Arcs.CCaService,
      Arcs.HistoryService,
      Arcs.ThreejsService,
      Arcs.ShaderService,
      Arcs.TensorflowService,
      Arcs.BodySegmentationService
    ];
    this.userAssembly = [ExtRecipe];
    this.persistor = new Arcs.LocalStoragePersistor('user');
  }
  async spinup() {
    await super.spinup();
    // this.arcs.set('user', 'selectedPipeline', selectedPipeline);
    // this.arcs.set('user', 'pipelines', pipelines);
  }
};
