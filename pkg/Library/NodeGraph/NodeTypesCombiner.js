/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({builtinNodeTypes, selectedPipeline}, state, {service}) {
  const results = {};
  entries(builtinNodeTypes).forEach(([key, nodeType]) => results[key] = nodeType);
  for (const [nodeId, {html, js, spec}] of entries(selectedPipeline?.custom)) {
    if (spec?.$meta?.id && spec?.$meta?.category) {
      results[nodeId] = spec;
    }
    await this.registerCustomParticle(nodeId, {html, js}, state, service);
  }
  return {results};
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
