/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({builtinNodeTypes, selectedGraph}, state, {service}) {
  const results = {};
  const outputs = {results};
  this.addBuiltinNodeTypes(builtinNodeTypes, results);
  if (this.updateGraphCustomNodeTypes(selectedGraph)) {
    assign(outputs, {selectedGraph});
  }
  await this.addCustomNodeTypes(selectedGraph?.custom, results, state, service);
  if (this.updateGraphCustomNodes(selectedGraph, results)) {
    assign(outputs, {selectedGraph});
  }
  return outputs;
},

addBuiltinNodeTypes(builtinNodeTypes, results) {
  entries(builtinNodeTypes).forEach(
      ([key, nodeType]) => results[key] = this.flattenNodeType(nodeType));
},

// TODO(mariakleiner): duplicate from RecipeBuilder, factor?
flattenNodeType(nodeType, $container) {
  const flattened = {};
  keys(nodeType).forEach(key => {
    if (key.startsWith('$')) {
      flattened[key] = nodeType[key];
    } else {
      assign(flattened, this.flattenParticleSpec(key, nodeType[key], $container));
    }
  });
  return flattened;
},

flattenParticleSpec(particleId, particleSpec, $container) {
  const flattened = {
    [particleId]: {
      ...particleSpec,
      $slots: {},
      ...($container && {$container})
    }
  };
  entries(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
    assign(flattened, this.flattenNodeType(slotRecipe, `${particleId}#${slotId}`));
    flattened[particleId].$slots[slotId] = {};
  });
  return flattened;
},

updateGraphCustomNodeTypes(graph) {
  return keys(graph?.custom)
      .map(key => {
        if (!graph.nodes[key]) {
          delete graph.custom[key];
          return true;
        }
      })
      .some(changed => changed);
},

updateGraphCustomNodes(graph, nodeTypes) {
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
      results[nodeId] = this.flattenNodeType(spec);
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
