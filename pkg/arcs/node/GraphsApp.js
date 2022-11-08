/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../../Library/App/Node/App.js';
//import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
//import {HistoryService} from '../../Library/App/HistoryService.js';
//import {MediaService} from '../../Library/NewMedia/MediaService.js';
//import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
//import {FaceMeshService} from '../../Library/Mediapipe/FaceMeshService.js';
//import {SelfieSegmentationService} from '../../Library/Mediapipe/SelfieSegmentationService.js';
//import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';
//import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
//import {CocoSsdService} from '../../Library/TensorFlow/CocoSsdService.js';
//import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {JSONataService} from '../../Library/JSONata/JSONataService.js';
import {GraphsRecipe} from '../Library/GraphsRecipe.js';
import {logFactory} from '../../Library/Core/utils.min.js';

const log = logFactory(true, 'Graphs', 'navy');

// App class
export const GraphsApp = class extends App {
  constructor(paths) {
    super(paths);
    //this.persistor = new LocalStoragePersistor('user');
    this.services = {
      JSONataService
    };
    this.recipes = [GraphsRecipe];
    log('Welcome!');
  }
};
