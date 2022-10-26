/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({newNodeInfos, pipeline, nodeTypes}) {
  if (newNodeInfos?.length > 0) {
    newNodeInfos.forEach(({type, nodeData}) => {
      const newNode = this.makeNewNode(pipeline, nodeTypes[type]);
      pipeline.nodes[newNode.id] = newNode;
    });
    return {
      newNodeInfos: [],
      pipeline
      // TODO(mariakleiner): update selectedNodeId and layout (from `nodeData`).
    };
  }
},

makeNewNode(pipeline, nodeType) {
  const index = this.countNodesOfType(pipeline.nodes, nodeType.$meta.id) + 1;
  const id = this.formatNodeId(nodeType.$meta.id, index);
  return this.formatNode(id, index, nodeType.$meta);
},

formatNode(id, index, {id: type, displayName}) {
  return {
    id, index, type,
    displayName: this.formatDisplayName(displayName || type, index)
  };
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
