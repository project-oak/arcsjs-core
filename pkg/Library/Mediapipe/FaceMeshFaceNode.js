export const FaceMeshFace = {
  $meta: {
    id: 'FaceMeshFace',
    displayName: 'Face Display',
    description: 'Face Display',
    category: 'Mediapipe'
  },
  $stores: {
    data: {
      $type: 'FaceData',
      nomonitor: true,
      noinspect: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  FaceMeshFace: {
    $kind: 'Mediapipe/FaceMeshFace',
    $inputs: ['data'],
    $outputs: ['outputImage']
  }
};
