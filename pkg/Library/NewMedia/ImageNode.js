
export const Image = {
  $meta: {
    id: 'Image',
    category: 'Media'
  },
  $stores: {
    image: {
      $type: 'Image',
      $value: {
        url: 'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
      }
    },
    connectedImage: {
      $type: 'Image',
      connection: true
    }
  },
  field: {
    $kind: '$library/NewMedia/Image',
    $inputs: ['connectedImage', 'image'],
    $outputs: ['image']
  }
};