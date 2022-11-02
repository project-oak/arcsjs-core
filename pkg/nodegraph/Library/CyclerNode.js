export const CyclerNode = {
  $meta: {
    id: 'CyclerNode',
    displayName: 'Cycler',
    category: 'Fresh'
  },
  $stores: {
    trigger:  {
      $type: 'Boolean',
      $value: false
    },
    prompt: {
      $type: 'String',
      noinspect: true
    },
    result: {
      $type: 'String',
      noinspect: true
    }
  },
  looper: {
    $kind: '$app/Library/looper',
    $inputs: [
      'trigger',
      {feedback: 'result'}
    ],
    $outputs: ['prompt']
  },
  piper: {
    $kind: '$app/Library/Piper',
    $inputs: ['prompt'],
    $outputs: ['result']
  }
};