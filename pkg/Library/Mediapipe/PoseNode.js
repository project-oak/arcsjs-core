export const PoseNode = {
  $meta: {
    id: 'PoseNode',
    displayName: 'Pose Detection',
    description: 'Mediapipe Pose Detection',
    category: 'Mediapipe',
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    pose: {
      $type: 'PoseData',
      noinspect: true
    }
  },
  Pose: {
    $kind: 'Mediapipe/Pose',
    $inputs: ['image'],
    $outputs: ['pose']
  }
};
