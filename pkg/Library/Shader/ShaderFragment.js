/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 ({
  async initialize({}, state, {service}) {
    state.canvas = await service({kind: 'ThreejsService', msg: 'allocateCanvas'});
  },
  async update(inputs, state, {service}) {
    //log(inputs.image);
    const {shader, image} = inputs;
    if (shader !== state.shader) {
      state.shader = shader;
      state.shaderId = await this.updateShaderId(state.shaderId, shader, service);
    }
    if (state.shaderId && image?.canvas) {
      state.output = await this.updateOutputCanvas(inputs, state, {service});
      return {output: state.output};
    }
  },
  async updateShaderId(shaderId, shader, service) {
    return shader && await service({
      kind: 'ShaderService',
      msg: 'makeShader',
      data: {shader, shaderId}
    });
  },
  async updateOutputCanvas(inputs, state, {service}) {
    const output = {
      canvas: state.canvas,
      version: Math.random()
    };
    await this.shaderize(state.shaderId, inputs, output, service);
    return output;
  },
  async shaderize(shaderId, {shader, image, image2, image3, image4}, output, service) {
    return service({
      kind: 'ShaderService',
      msg: 'runFragment',
      data: {
        shaderId,
        shader,
        inImageRefs: [image, image2, image3, image4],
        outImageRef: output
      }
    });
  },
  render({shader}, {output}) {
    return {
      output,
      code: shader || ''
    };
  },
  onCodeChanged({eventlet: {key, value}}) {
    if (key === 'code') {
      return {shader: value};
    }
  },
  template: html`
  <style>
    :host {
      background-color: black;
      color: #eee;
      overflow: hidden;
      /* width: 240px;
      height: 300px;
      padding: 8px;
      border-radius: 8px; */
    }
  </style>
  <mxc-tab-pages flex tabs="Output, Code">
    <image-resource center flex image="{{output}}"></image-resource>
    <code-mirror flex text="{{code}}" key="code" on-blur="onCodeChanged"></code-mirror>
  </mxc-tab-pages>
  `
  });
