/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {etc} from "./arcs.js";

export const ExtRecipe = {
  $stores: {
    "deviceimage1:output": {
      image: {
        $type: 'Image',
        connection: true,
        nomonitor: true
      }
    }
  },
  device1image: {
    $kind: '$library/NewMedia/DeviceImage',
    $inputs: [{'image': 'frame'}],
    $outputs: [{'output': 'deviceimage1:output'}]
  },
  echo: {
    $kind: '$library/Echo',
    $staticInputs: {
      html: `<div frame="camera" style="display: flex; height: 400px; border: 1px solid silver;"></div>`
    },
    $slots: {
      camera: etc.CameraNode
    }
  }
};
