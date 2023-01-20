import { nodeTypes } from "./nodeTypes";

/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({nodeTypesResource}, state, {service}) {
  const nodeTypes = await service({msg: 'getResource', resourceId: nodeTypesResource});
  log(nodeTypes);
  return {nodeTypes};
}

});