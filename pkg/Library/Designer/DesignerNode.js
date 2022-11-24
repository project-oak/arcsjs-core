export const DesignerNode = {
  designer: {
    $kind: '$library/Designer/Designer',
    $inputs: [
      'recipes',
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'previewLayout'},
      'newNodeInfos'
    ],
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      {layout: 'previewLayout'},
      'newNodeInfos'
    ]
  }
};