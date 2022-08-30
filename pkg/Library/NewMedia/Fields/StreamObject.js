export const StreamObject = {
  $meta: {
    name: 'Stream',
    category: 'Media'
  },
  $stores: {
    outputStream: {
      $type: 'Stream'
    }
    // inputStream: {
    //   $type: 'Stream',
    //   $value: {
    //     id: 'default',
    //     version: 0
    //   }
    // },
    // image: {
    //   $type: 'Image',
    //   $value: {
    //     url: 'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
    //     canvas: {
    //       id: 0,
    //       version: 0
    //     }
    //   }
    // }
  },
  field: {
    $kind: '$library/NewMedia/Stream'
    // $inputs: ['image']
  }
};