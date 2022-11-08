/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../../Library/Core/utils.min.js';
import {App} from '../../Library/App/Worker/App.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
// import {HistoryService} from '../../Library/App/HistoryService.js';
// import {MediaService} from '../../Library/NewMedia/MediaService.js';
// import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
// import {FaceMeshService} from '../../Library/Mediapipe/FaceMeshService.js';
// import {SelfieSegmentationService} from '../../Library/Mediapipe/SelfieSegmentationService.js';
// import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';
// import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
// import {CocoSsdService} from '../../Library/TensorFlow/CocoSsdService.js';
// import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {JSONataService} from '../../Library/JSONata/JSONataService.js';
import {GraphsRecipe} from './GraphsRecipe.js';
import {RecipeBuilder} from '../../Library/Graphs/RecipeBuilder.js';
import {NodeTypes as nodeTypes} from '../../Library/GraphsNodes/NodeTypes.js';
//import {Graph} from './Graph.js';

const log = logFactory(true, 'ArcsApp', 'navy');

// App class
export const ArcsApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {
      JSONataService
      // HistoryService,
      // MediaService,
      // ThreejsService,
      // ShaderService,
      // FaceMeshService,
      // SelfieSegmentationService,
      // TensorFlowService,
      // CocoSsdService,
      // GoogleApisService
    };
    this.recipes = [GraphsRecipe];
    log('Welcome!');
  }
  async spinup() {
    await super.spinup();
    //this.addGraph(Graph);
  }
  async onservice(user, host, request) {
    if (request?.msg === 'addGraph') {
      return this.addGraph(request.data.graph);
    }
  }
  async addGraph(graph) {
    const recipes = RecipeBuilder.construct({graph, nodeTypes});
    //
    log.groupCollapsed('constructed recipes:');
      log.groupCollapsed('from nodeTypes:');
      log.log(JSON.stringify(nodeTypes, null, '  '));
      log.groupEnd();
    log.log(JSON.stringify(recipes, null, '  '));
    log.groupEnd();
    //
    return this.arcs.addRecipes('user', recipes);
  }
};
