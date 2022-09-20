
export const Image = {
  $meta: {
    name: 'Image',
    category: 'Media'
  },
  $stores: {
    image: {
      $type: 'Image',
      $value: {
        url: 'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
      }
    }
  },
  field: {
    $kind: '$library/NewMedia/Image',
    $inputs: ['image'],
    $outputs: ['image']
  }
};