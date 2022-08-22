({
/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

async initialize() {
  // important so other objects know when new classifier comes online
  return {classifierResults: null, status: 'initializing'};
},

async update({imageRef, model, modelKind}, state, {service, output}) {
  imageRef = imageRef?.url || imageRef;
  // we always update once when we output, block the cycle here
  if (state.imageRef !== imageRef || state.model.url !== model.url) {
    assign(state, {imageRef, model});
    log('working on', state);
    output({classifierResults: null, status: 'working'});
    const classifierResults = await this.perceive({imageRef, modelUrl: model?.url, modelKind}, service);
    return {
      status: classifierResults ? 'complete' : 'failed',
      classifierResults
    };
  }
},

async perceive({imageRef, modelUrl, modelKind}, service) {
  if (imageRef && modelUrl) {
    const msg = {ObjectDetector: 'taskDetect'}[modelKind] || 'taskClassify';
    return await service({kind: 'TensorFlowService', msg, data: {imageRef, modelUrl}});
  }
}

});
