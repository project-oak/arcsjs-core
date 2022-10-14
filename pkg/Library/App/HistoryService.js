/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// a "service" is a routine that (some) Particles can invoke

import {Params} from './Params.js';

export const HistoryService = {
  retrieveSelectedPipeline({keepParam}) {
    const pipeline = Params.getParam('pipeline');
    if (!keepParam) {
      Params.replaceUrlParam('pipeline', null);
    }
    return pipeline;
  },
  setSelectedPipeline({pipeline}) {
    Params.setUrlParam('pipeline', pipeline);
  },
  generateAndCopyRunnerUrlForPipeline({pipeline}) {
    const url = new URL(document.URL);
    const runnerUrl =
        `${url.origin}${url.pathname.replace('studio', 'runner')}?pipeline=${
            pipeline.$meta.id}`;
    navigator.clipboard.writeText(runnerUrl);
  }
};
