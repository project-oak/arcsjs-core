/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const toPipeline = graph => {
  // convert 'Graph' to 'Pipeline'
  const nodes = {};
  const graph = {
    $meta: {
      id: "dynamic",
      name: 'Dynamic'
    },
    nodes
  };
  Object.entries(graph).forEach(([name, value]) => {
    const node = {...value, id: name};
    const connections = {};
    if (node.connections) {
      Object.entries(node.connections).forEach(([name, connects]) => {
        connections[name] = connects.map(conn => {
          const [from, storeName] = conn.split(':');
          return {from, storeName};
        });
      });
    }
    node.connections = connections;
    nodes[name] = node;
  });
  return graph;
  // app.arcs.set('user', 'selectedGraph', graph)
};
