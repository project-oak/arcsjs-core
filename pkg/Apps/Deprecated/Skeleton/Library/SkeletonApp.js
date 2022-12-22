/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {logFactory} from '../../Library/Core/utils.min.js.js';
import {App} from '../../Library/App/Worker/App.js.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js.js';
// import {HistoryService} from '../../Library/App/HistoryService.js';
// import {MediaService} from '../../Library/NewMedia/MediaService.js';
// import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
// import {FaceMeshService} from '../../Library/Mediapipe/FaceMeshService.js';
// import {SelfieSegmentationService} from '../../Library/Mediapipe/SelfieSegmentationService.js';
// import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';
// import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
// import {CocoSsdService} from '../../Library/TensorFlow/CocoSsdService.js';
// import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {SkeletonRecipe} from './SkeletonRecipe.js';

const log = logFactory(true, 'Skeleton', 'navy');

// App class
export const SkeletonApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {
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
    this.recipes = [SkeletonRecipe];
    log('Welcome!');
  }
};
