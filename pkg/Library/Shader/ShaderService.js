/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../core.js';
import {uniformsFactory, fragmentShader} from './shader-tools.js';
import {THREE} from '../Threejs/threejs-import.js';

const {assign} = Object;

const log = logFactory(logFactory.flags.services || logFactory.flags.ShaderService, 'ShaderService', 'teal');

const isImproperSize = (width, height) => !width || !height;

const getResource = id => globalThis.resources?.[id];
const setResource = (id, resource) => globalThis.resources && (globalThis.resources[id] = resource);
const freeResource = id => globalThis.resources[id] = null;
const newId = () => Math.floor(Math.random()*1e3 + 9e2);

export const ShaderService = {
  makeShader({shader, shaderId}) {
    freeResource(shaderId);
    shaderId = newId();
    const fragShader = new ShaderJunk();
    setResource(shaderId, fragShader);
    fragShader.init(shader);
    return shaderId;
  },
  async runFragment({shaderId, inImageRefs, outImageRef}) {
    const shader = getResource(shaderId);
    const outCanvas = getResource(outImageRef?.canvas);
    const inCanvases = inImageRefs.map(ref => ref && getResource(ref.canvas));
    if (inCanvases?.[0] && outCanvas && shader) {
      const {width, height} = inCanvases[0];
      if (isImproperSize(width, height)) {
        log.warn('input canvas is improper', width, height);
      } else {
        assign(outCanvas, {width, height});
        shader?.render(inCanvases, outCanvas);
      }
    }
    return outImageRef;
  },
};

const ShaderJunk = class {
  constructor() {
    this.ready = false;
    globalThis.junk = this;
  }
  dispose() {
    this.ready = false;
    this.renderer?.dispose();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }
  async init(fragment) {
    try {
      this.createStuff(fragmentShader(fragment));
    } catch(x) {
      log.error('renderer initialization failed');
      log.groupCollapsed('details');
      log(x);
      log.groupEnd();
    }
  }
  createStuff(fragmentShader) {
    // webGL resolution
    const [width, height] = [1280, 720];
    // shader parameters
    const uniforms = uniformsFactory();
    this.uniforms = uniforms;
    this.uniforms.iResolution.value.set(width, height, 1);
    // inputs texture for shader
    const channels = [
      this.createChannel(width, height),
      this.createChannel(width, height),
      this.createChannel(width, height),
      this.createChannel(width, height)
    ];
    this.channels = channels;
    // attach textures to channels
    uniforms.iChannel0 = {value: channels[0].texture};
    uniforms.iChannel1 = {value: channels[1].texture};
    uniforms.iChannel2 = {value: channels[2].texture};
    uniforms.iChannel3 = {value: channels[3].texture};
    // our shader material
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      uniforms
    });
    // geometry to draw onto
    const plane = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(plane, material);
    // create scene
    this.scene = new THREE.Scene();
    this.scene.add(mesh);
    // create camera
    const camera = new THREE.OrthographicCamera(
      -1, // left
       1, // right
       1, // top
      -1, // bottom
      -1, // near
       1  // far
    );
    this.camera = camera;
    // target canvas for GL projection
    this.shadedCanvas = new OffscreenCanvas(width, height);
    // construct renderer
    const renderer = new THREE.WebGLRenderer({canvas: this.shadedCanvas});
    //renderer.autoClearColor = false;
    this.renderer = renderer;
  }
  createChannel(width, height) {
    const textureCanvas = new OffscreenCanvas(width, height);
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return {texture, textureCanvas};
  }
  render(inCanvases, outCanvas) {
    // advance time
    this.timeCadence();
    // inCanvases will be stretched to fix textureCanvas dimensions
    inCanvases.forEach((canvas, i) => {
      const channel = this.channels[i];
      if (canvas && channel) {
        this.updateChannel(channel, canvas);
      }
    });
    // shadedCanvas will be stretched to fix outCanvas dimensions
    this.privateRender(outCanvas);
  }
  updateChannel(inChannel, inCanvas) {
    // inCanvas will be stretched to fix textureCanvas dimensions
    const {width, height} = inChannel.textureCanvas;
    inChannel.textureCanvas.getContext('2d')
      .drawImage(inCanvas, 0, 0, width, height);
    inChannel.texture.needsUpdate = true;
  }
  privateRender(outCanvas) {
    // attempt to render the scene
    try {
      // project the image in through the shader,
      // onto the surface, and out through the camera
      this.renderer.render(this.scene, this.camera);
      // shadedCanvas will be stretched to fix outCanvas dimensions
      outCanvas.getContext('2d')
        .drawImage(this.shadedCanvas, 0, 0, outCanvas.width, outCanvas.height);
    } catch(x) {
      // uhps
      this.ready = false;
      log.error('WebGL renderer failed');
      console.groupCollapsed('error');
      console.error(x);
      console.log(this);
      console.groupEnd();
    }
  }
  timeCadence() {
    // now is now
    const now = Date.now();
    this.start = this.start || now;
    // time since last time, otherwise 16ms
    const delta = this.last ? now - this.last : 16;
    // memoize
    this.last = now;
    // record uniforms for shader
    this.uniforms.iTimeDelta.value = delta * 1e-3; // ms to s
    this.uniforms.iTime.value = (now-this.start) * 1e-3; // ms to s
  }
};

const defaultShader = `
/*
 * Webcam 'Giant in a lake' effect by Ben Wheatley - 2018
 * License MIT License
 * Contact: github.com/BenWheatley
 */

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float time = iTime;
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec2 pixelSize = vec2(1,1) / iResolution.xy;

    vec3 col = texture(iChannel0, uv).rgb;
    float mirrorPos = 0.3;
    if (uv.y < mirrorPos) {
        float distanceFromMirror = mirrorPos - uv.y;
        float sine = sin((log(distanceFromMirror)*20.0) + (iTime*2.0));
        float dy = 30.0*sine;
        float dx = 0.0;
        dy *= distanceFromMirror;
        vec2 pixelOff = pixelSize * vec2(dx, dy);
        vec2 tex_uv = uv + pixelOff;
        tex_uv.y = (0.6 /* magic number! */) - tex_uv.y;
        col = texture(iChannel0, tex_uv).rgb;

        float shine = (sine + dx*0.05) * 0.05;
        col += vec3(shine, shine, shine);
    }

    fragColor = vec4(col,1.);
}
`;