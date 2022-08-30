export const ImageCaptureObject = {
  $meta: {
    name: 'ImageCapture',
    category: 'Media'
  },
  $stores: {
    inputStream: {
      $type: 'Stream',
      //noinspect: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true
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
    $kind: '$library/NewMedia/ImageCapture',
    // $inputs: ['image']
  }
};