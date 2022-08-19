/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {DeviceUxRecipe} from '../../Library/Media/DeviceUxRecipe.js';

export const RemoteRecipe = {
  $meta: {
    description: 'Remote Recipe'
  },
  $stores: {
    persona: {$type: 'Persona'},
    remoteStream: {$type: 'Stream'}
  },
  stream: {
    $kind: '$library/Media/MediaStream'
  },
  flyout: {
    $kind: '$library/Layout/FlyOut'
  },
  remote: {
    $kind: '$app/Library/Remote',
    $slots: {
      devices: DeviceUxRecipe,
      camera: {
        camera: {
          $kind: '$library/Media/InputCamera'
        }
      },
      tv: {
        tv: {
          $kind: '$app/Library/Tv',
          $inputs: [{stream: 'remoteStream'}]
        }
      }
    }
  }
};
