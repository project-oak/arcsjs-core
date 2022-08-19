/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {DeviceUxRecipe} from '../../Library/Media/DeviceUxRecipe.js';

export const ComputeRecipe = {
  $meta: {
    description: 'Compute Recipe'
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
  compute: {
    $kind: '$app/Library/Compute',
    $slots: {
      // devices: DeviceUxRecipe,
      camera: {
        camera: {
          //$kind: '$library/Media/InputCamera'
          $kind: '$app/library/Tv',
          $inputs: [{stream: 'remoteStream'}]
        }
      }
    }
  }
};
