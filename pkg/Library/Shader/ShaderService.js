/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../core.js';
import {uniformsFactory, fragmentShader} from './shader-toy.js';
import {THREE} from '../Threejs/threejs-import.js';

const {assign} = Object;

const log = logFactory(logFactory.flags.services || logFactory.flags.ShaderService, 'ShaderService', 'teal');
//const dom = (tag, props, container) => (container ?? document.body).appendChild(assign(document.createElement(tag), props));

//const isImproperSize = (width, height) => (width !== 1280 && width !== 640) || (height !== 480 && height !== 720);
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
    const inCanvases = inImageRefs.map(ref => ref && getResource(ref.canvas));
    const inCanvas = inCanvases[0];
    const outCanvas = getResource(outImageRef?.canvas);
    const shader = getResource(shaderId);
    //
    if (inCanvas && outCanvas && shader) {
      const {width, height} = inCanvas;
      if (isImproperSize(width, height)) {
        log.warn('input canvas is improper', width, height);
      } else {
        assign(outCanvas, {width, height});
        //const key = `${inImageRef?.canvas}:${outImageRef?.canvas}`;
        //const key = `${outImageRef?.canvas}`;
        //const compiledShader = await this.requireShader(shaderId, key, inCanvas, outCanvas, shader);
        shader?.render(inCanvas, outCanvas);
      }
    }
    return outImageRef;
  },
  // async requireShader(shaderId, canvasKeys, inCanvas, outCanvas, fragment) {
  //   // one shader per shader id
  //   let shader = getResource(shaderId);
  //   // but we must rebuild the shader if the canvasses change
  //   // TODO(sjmiles): changing the canvas size(s) will break the shader
  //   if (!shader || shader.canvasKeys !== canvasKeys) {
  //     shader?.dispose();
  //     log('allocating shader', shaderId, canvasKeys);
  //     shader = new ShaderJunk();
  //     shader.canvasKeys = canvasKeys;
  //     setResource(shaderId, shader);
  //     await shader.init(inCanvas, outCanvas, fragment);
  //   }
  //   return shader;
  // }
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
    this.ready = false;
    try {
      this.createStuff(fragmentShader(fragment));
      //this.initRenderer(inCanvas, outCanvas, fragmentShader(fragment));
    } catch(x) {
      log.error('renderer initialization failed');
      log.groupCollapsed('details');
      log(x);
      log.groupEnd();
    }
  }
  createStuff(fragmentShader) {
    // dynamic texture
    const res = {width: 1280, height: 720};
    this.textureCanvas = new OffscreenCanvas(res.width, res.height);
    this.shadedCanvas = new OffscreenCanvas(res.width, res.height);
    //this.shadedCanvas = dom('canvas', {...res, style: `display: block; width: ${res.width}px; ${res.height}: 180px;`});
    const texture = new THREE.CanvasTexture(this.textureCanvas);
    this.texture = texture;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const uniforms = uniformsFactory();
    this.uniforms = uniforms;
    uniforms.iChannel0 = {value: texture};
    this.uniforms.iResolution.value.set(res.width, res.height, 1);
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
    // construct renderer
    const renderer = new THREE.WebGLRenderer({canvas: this.shadedCanvas});
    //renderer.autoClearColor = false;
    this.renderer = renderer;
    this.ready = true;
  }
  // initRenderer(inCanvas, outCanvas, fragmentShader) {
  //   const texture = new THREE.CanvasTexture(inCanvas);
  //   this.texture = texture;
  //   texture.minFilter = THREE.NearestFilter;
  //   texture.magFilter = THREE.NearestFilter;
  //   texture.wrapS = THREE.RepeatWrapping;
  //   texture.wrapT = THREE.RepeatWrapping;

  //   const uniforms = uniformsFactory();
  //   this.uniforms = uniforms;
  //   uniforms.iChannel0 = {value: texture};

  //   log('create material');
  //   const material = new THREE.ShaderMaterial({
  //     fragmentShader,
  //     uniforms
  //   });

  //   // geometry to draw onto
  //   const plane = new THREE.PlaneGeometry(2, 2);
  //   const mesh = new THREE.Mesh(plane, material);
  //   //
  //   this.scene = new THREE.Scene();
  //   this.scene.add(mesh);
  //   //
  //   const {width, height} = inCanvas;
  //   //assign(outCanvas, {width, height});
  //   //const [width, height] = [1280, 720];
  //   this.size = {width, height};
  //   this.uniforms.iResolution.value.set(width, height, 1);
  //   //console.log(`iResolution.value.set(${width}, ${height}, 1)`);
  //   //console.log(this.uniforms);
  //   //
  //   const renderer = new THREE.WebGLRenderer({canvas: outCanvas});
  //   //renderer.autoClearColor = false;
  //   this.renderer = renderer;
  //   //
  //   const camera = new THREE.OrthographicCamera(
  //     -1, // left
  //      1, // right
  //      1, // top
  //     -1, // bottom
  //     -1, // near
  //      1  // far
  //   );
  //   this.camera = camera;
  //   //
  //   this.ready = true;
  //   log('initShader complete');
  // }
  render(inCanvas, outCanvas) {
    if (this.ready && inCanvas && outCanvas) {
      this.privateRender(inCanvas, outCanvas);
    }
  }
  privateRender(inCanvas, outCanvas) {
    const {width, height} = this.textureCanvas;
    this.textureCanvas.getContext('2d').drawImage(inCanvas, 0, 0, width, height);
    //const [width, height] = [1280, 720];
    //const {width, height} = inCanvas;
    //if (!width || !height) { //width !== 1280 || height !== 720) {
    //  log.warn('input canvas is improper');
    //} else {
      const now = Date.now();
      this.start = this.start || now;
      //
      const delta = this.last ? now - this.last : 16;
      this.uniforms.iTimeDelta.value = delta * 1e-3; // ms to s
      //
      this.last = now;
      this.uniforms.iTime.value = (now-this.start) * 1e-3; // ms to s
      //
      this.texture.needsUpdate = true;
      try {
        this.renderer.render(this.scene, this.camera);
      } catch(x) {
        this.ready = false;
        log.error('WebGL renderer failed');
        console.groupCollapsed('error');
        console.error(x);
        console.log(this);
        console.groupEnd();
      }
      outCanvas.getContext('2d').drawImage(this.shadedCanvas, 0, 0, outCanvas.width, outCanvas.height);
      //this.shadedCanvas.getContext('2d').drawImage(outCanvas, 0, 0, outCanvas.width, outCanvas.height);
    //}
  }
};
