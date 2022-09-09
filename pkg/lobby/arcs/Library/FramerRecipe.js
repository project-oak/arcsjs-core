import {LobbyRecipe} from './LobbyRecipe.js';

const FrameGrabberRecipe = {
  $stores: {
    // grabberStream: {
    //   $type: 'Stream',
    //   connection: true
    // },
    grabberImage: {
      $type: 'Image'
    },
    grabberFrequency: {
      $type: 'number',
      $value: 40
    }
  },
  camera: {
    $kind: '$library/Media/InputCamera',
    $staticInputs: {
      stream: 'default'
    },
    $inputs: [
      {frequency: 'grabberFrequency'},
      {stream: 'stream'}
    ],
    $outputs: [
      {image: 'grabberImage'}
    ]
  }
};

export const FramerRecipe = {
  $meta: {
    name: "Framer Recipe"
  },
  framer: {
    $kind: '$app/Library/Framer',
    $slots: {
      lobby: LobbyRecipe,
      grabber: FrameGrabberRecipe,
    }
  }
};