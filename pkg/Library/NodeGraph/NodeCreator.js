/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({newNodeInfos, graph, nodeTypes}) {
  if (newNodeInfos?.length > 0) {
    let selectedNodeId;
    newNodeInfos.forEach(({type, nodeData, ...layouts}) => {
      const newNode = this.makeNewNode(graph, nodeTypes[type]);
      assign(newNode, nodeData);
      graph.nodes[newNode.id] = newNode;
      graph.layout ??= {};
      keys(layouts).forEach(layoutId => {
        graph.layout[layoutId] ??= {};
        graph.layout[layoutId][newNode.id] = layouts[layoutId];
      });
      selectedNodeId = newNode.id;
    });
    return {
      newNodeInfos: [],
      graph,
      selectedNodeId
    };
  }
},

makeNewNode(graph, nodeType) {
  const {id: type, displayName: nodeTypeDisplayName} = nodeType.$meta;
  const index = this.countNodesOfType(graph.nodes, type) + 1;
  const id = this.formatNodeId(type, index);
  const displayName = this.formatDisplayName(nodeTypeDisplayName || type, index);
  return {id, type, displayName};
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
