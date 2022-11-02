/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({

update({graph, previewLayout, nodegraphLayout}) {
  if (graph && graph.$meta.id === previewLayout?.id && graph.$meta.id === nodegraphLayout?.id) {
    graph.position ??= {};
    let changed = false;
    if (!deepEqual(previewLayout, graph.position.previewLayout)) {
      assign(graph.position, {previewLayout});
      changed = true;
    }
    if (!deepEqual(nodegraphLayout, graph.position.nodegraphLayout)) {
      assign(graph.position, {nodegraphLayout});
      changed = true;
    }
    if (changed) {
      return {graph};
    }
  }
}

});
