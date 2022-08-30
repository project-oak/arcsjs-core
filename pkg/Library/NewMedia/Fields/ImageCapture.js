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
  },
  field: {
    $kind: '$library/NewMedia/ImageCapture',
  }
};