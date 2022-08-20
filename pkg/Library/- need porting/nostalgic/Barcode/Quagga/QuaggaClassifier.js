/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async initialize() {
  // important so other objects know when new classifier comes online
  return {classifierResults: null, status: 'initializing'};
},

async update({imageRef, readers}, state, {service, output}) {
  // we always update once when we output, block the cycle here
  if (state.imageRef !== imageRef) {
    assign(state, {imageRef});
    output({classifierResults: null, status: 'working'});
    return {
      status: 'complete',
      classifierResults: await this.perceive(imageRef, readers, service)
    };
  }
},

async perceive(imageRef, readers, service) {
  if (imageRef) {
    const data = {src: imageRef, readers};
    return await service({kind: 'QuaggaService', msg: 'decode', data});
  }
}

});
