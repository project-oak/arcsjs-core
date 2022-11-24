const RecipeBuilder = {
  candidateFinder: {
    $kind: '$library/NodeGraph/CandidateFinder',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  connectionUpdater: {
    $kind: '$library/NodeGraph/ConnectionUpdater',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{graph: 'selectedGraph'}]
  },
  recipeBuilder: {
    $kind: '$library/RecipeBuilder/RecipeBuilder',
    $inputs: [
      'nodeTypes',
      {graph: 'selectedGraph'},
      {layout: 'previewLayout'}
    ],
    $outputs: ['recipes']
  }
};