export const FaceMeshSticker = {
  $meta: {
    id: 'FaceMeshSticker',
    displayName: 'Face Sticker',
    description: 'Mediapipe Face Sticker',
    category: 'Mediapipe'
  },
  $stores: {
    data: {
      $type: 'FaceData',
      nomonitor: true,
      noinspect: true,
      connection: true
    },
    index: {
      $type: 'Number',
      range: {min: 0, max: 468, step: 1}
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    sticker: {
      $type: 'Image',
      connection: true
    }
  },
  FaceSticker: {
    $kind: 'Fx/FaceSticker',
    $inputs: ['data', 'sticker', 'index'],
    $outputs: ['outputImage']
  }
};
