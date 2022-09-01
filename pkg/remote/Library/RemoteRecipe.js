/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {DeviceUxRecipe} from '../../Library/Media/DeviceUxRecipe.js';

export const RemoteRecipe = {
  $meta: {
    description: 'Remote Recipe'
  },
  $stores: {
    persona: {$type: 'Persona'},
    group: {
      $type: 'String',
      $value: 'universal'
    },
    remoteStream: {$type: 'Stream'},
    showFlyout: {$type: 'Boolean'}
  },
  stream: {
    $kind: '$library/Media/MediaStream'
  },
  flyout: {
    $kind: '$library/Layout/FlyOut',
    $inputs: [{show: 'showFlyout'}],
    $outputs: [{show: 'showFlyout'}],
    $slots: {
      flyout: {
        profile: {
          $kind: '$app/Library/LobbySettings',
          $inputs: ['group', 'persona'],
          $outputs: ['group', 'showFlyout']
        }
      }
    }
  },
  remote: {
    $kind: '$app/Library/Remote',
    $inputs: ['showFlyout', 'persona', 'group'],
    $outputs: ['showFlyout'],
    $slots: {
      devices: DeviceUxRecipe,
      camera: {
        camera: {
          $kind: '$library/Media/InputCamera',
          $staticInputs: {stream: 'default'}
        }
      },
      tv: {
        tv: {
          $kind: '$library/Media/InputCamera',
          $inputs: [{stream: 'remoteStream'}]
        }
      }
    }
  }
};
