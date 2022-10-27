/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({newNodeInfos, pipeline, nodeTypes}) {
  if (newNodeInfos?.length > 0) {
    let selectedNodeId;
    newNodeInfos.forEach(({type, nodeData}) => {
      const newNode = this.makeNewNode(pipeline, nodeTypes[type]);
      assign(newNode, nodeData);
      pipeline.nodes[newNode.id] = newNode;
      selectedNodeId = newNode.id;
    });
    return {
      newNodeInfos: [],
      pipeline,
      selectedNodeId
      // TODO(mariakleiner): update selectedNodeId and layout (from `nodeData`).
    };
  }
},

makeNewNode(pipeline, nodeType) {
  const {id: nodeTypeId, displayName: nodeTypeDisplayName} = nodeType.$meta;
  const index = this.countNodesOfType(pipeline.nodes, nodeTypeId) + 1;
  const id = this.formatNodeId(nodeTypeId, index);
  const displayName = this.formatDisplayName(nodeTypeDisplayName || nodeTypeId, index);
  return {id, type: nodeTypeId, displayName};
},

countNodesOfType(nodes, type) {
  return values(nodes).filter(node => node.type === type).length;
},

formatDisplayName(name, index) {
  const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
},

formatNodeId(id, index) {
  return `${id}${index}`.replace(/ /g,'');
}

});
