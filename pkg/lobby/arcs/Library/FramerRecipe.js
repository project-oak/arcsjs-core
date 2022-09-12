import {LobbyRecipe} from './LobbyRecipe.js';

const FrameGrabberRecipe = {
  $stores: {
    grabberImage: {
      $type: 'Image'
    },
    grabberFrequency: {
      $type: 'number',
      $value: null
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
      grabber: FrameGrabberRecipe
    }
  }
};