/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 ({
  async update({image}, state, {service}) {
    if (image?.canvas) {
      const output = service({kind: 'MediapipeService', msg: 'holistic', data: {image}});
      return {output};
    }
  },
  template: html`
  <style>
    :host {
      overflow: hidden;
    }
  </style>
  Mediapipe
  `
  });
