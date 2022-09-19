export const StreamObject = {
  $meta: {
    name: 'Stream',
    category: 'Media'
  },
  $stores: {
    image: {
      $type: 'Image'
    },
    outputStream: {
      $type: 'Stream'
    }
  },
  field: {
    $kind: '$library/NewMedia/Stream',
    $inputs: ['image'],
    $outputs: ['outputStream']
  }
};