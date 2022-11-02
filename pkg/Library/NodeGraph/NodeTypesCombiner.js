/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({builtinNodeTypes, selectedPipeline}, state, {service}) {
  const results = {};
  const outputs = {results};
  this.addBuiltinNodeTypes(builtinNodeTypes, results);
  if (this.updatePipelineCustomNodeTypes(selectedPipeline)) {
    assign(outputs, {selectedPipeline});
  }
  await this.addCustomNodeTypes(selectedPipeline?.custom, results, state, service);
  if (this.updatePipelineCustomNodes(selectedPipeline, results)) {
    assign(outputs, {selectedPipeline});
  }
  return outputs;
},

addBuiltinNodeTypes(builtinNodeTypes, results) {
  entries(builtinNodeTypes).forEach(([key, nodeType]) => results[key] = nodeType);
},

updatePipelineCustomNodeTypes(graph) {
  return keys(graph?.custom)
      .map(key => {
        if (!graph.nodes[key]) {
          delete graph.custom[key];
          return true;
        }
      })
      .some(changed => changed);
},

updatePipelineCustomNodes(graph, nodeTypes) {
  return entries(graph?.nodes)
      .map(([key, node]) => {
        if (!nodeTypes[node.type]) {
          delete graph.nodes[key];
          return true;
        }
      })
      .some(changed => changed);
},

async addCustomNodeTypes(customNodeTypes, results, state, service) {
  for (const [nodeId, {html, js, spec}] of entries(customNodeTypes)) {
    if (spec?.$meta?.id && spec?.$meta?.category) {
      results[nodeId] = spec;
    }
    await this.registerCustomParticle(nodeId, {html, js}, state, service);
  }
},

async registerCustomParticle(nodeId, {html, js}, state, service) {
  if (html !== state[nodeId]?.html || js !== state[nodeId]?.js) {
    assign(state, {[nodeId]: {html, js}});
    await service({msg: 'updateParticle', data: {
      kind: nodeId,
      code: this.formatCode({html, js})
    }});
  }
},

formatCode({html, js}) {
  return `({
    ${js ? `${js},` : ''}
    ${html ? `template: html\`${html}\`` : ''}
  });`;
}

});
