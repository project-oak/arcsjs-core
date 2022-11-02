/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// a "service" is a routine that (some) Particles can invoke

import {Params} from './Params.js';

export const HistoryService = {
  retrieveSelectedPipeline() {
    const graph = Params.getParam('graph');
    Params.replaceUrlParam('graph', null);
    return graph;
  },
  setSelectedPipeline({graph}) {
    Params.setUrlParam('graph', graph);
  }
};
