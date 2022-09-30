/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({

update({pipeline, previewLayout, nodegraphLayout}) {
  if (pipeline && pipeline.$meta.id === previewLayout?.id && pipeline.$meta.id === nodegraphLayout?.id) {
    pipeline.position ??= {};
    let changed = false;
    if (!deepEqual(previewLayout, pipeline.position.previewLayout)) {
      assign(pipeline.position, {previewLayout});
      changed = true;
    }
    if (!deepEqual(nodegraphLayout, pipeline.position.nodegraphLayout)) {
      assign(pipeline.position, {nodegraphLayout});
      changed = true;
    }
    if (changed) {
      return {pipeline};
    }
  }
}

});