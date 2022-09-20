/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async initialize() {
  // important so other objects know when new classifier comes online
  return {
    classifierResults: null,
    status: 'initializing',
    modelKind: 'mobilenet'
  };
},

async update({imageRef, model, modelKind}, state, {service, output}) {
  // we always update once when we output, block the cycle here
  if (this.hasChanges({imageRef, model}, state)) {
    assign(state, {imageRef, model});
    //log('working on', state);
    output({classifierResults: null, status: 'working'});
    return await this.perceive({imageRef, model}, service);
  }
},

hasChanges({imageRef, model}, state) {
  return (state.imageRef?.json !== imageRef?.json) || (state.model?.url !== model?.url);
},

async perceive({imageRef, model}, service) {
  const args = {
    kind: 'TensorFlowService', //'TfjsService',
    msg: 'toolClassify',
    data: {
      imageRef,
      modelUrl: model?.url,
      modelKind: 'mobilenet'
    }
  };
  /////////////////
  // HACKALERT!
  // TODO(mariakleiner): actually run the service, instead of using hardcoded results.
  // const classifierResults = await service(args);
  const classifierResults = [
    {
      displayName: "strawberry",
      score: 0.9991282820701599
    },
    {
      displayName: "ice cream, icecream",
      score :0.00010875583393499255
    },
    {
      displayName: "thimble",
      score: 0.00008958124089986086
    }
  ];
  /////////////////
  return {
    status: classifierResults ? 'complete' : 'failed',
    classifierResults
  };
}

});
