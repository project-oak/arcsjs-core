/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Resources} from '../App/Resources.js';
import {loadImage} from '../Media/ImageLoader.js';
import {MediapipeClassifier} from './MediapipeClassifier.js';
import '../../third_party/mediapipe/drawing_utils.js';

const {drawLandmarks, drawConnectors, lerp} = globalThis;
const mpHolistic = globalThis;

// late-bind dependencies to reduce so we pay-for-usage

const local = import.meta.url.split('/').slice(0, -1).join('/');
const locateFile = file => `${local}/../../third_party/mediapipe/face_mesh/${file}`;

let FaceMesh;
const requireFaceMesh = async () => {
  if (!FaceMesh) {
    await MediapipeClassifier.import('../../third_party/mediapipe/face_mesh/face_mesh.js');
    FaceMesh = globalThis.FaceMesh;
  }
};

const masque = null; //await loadImage(`assets/masquerade.png`);
const scalar = 25;

export const FaceMeshService = {
  async classify({image, target}) {
    const realCanvas = Resources.get(image?.canvas);
    let results = {};
    if (realCanvas) {
      results = await FaceMeshModel.faceMesh(realCanvas);
      results.image = {canvas: results?.canvas, stream: image?.stream, version: Math.random()};
    }
    return results;
  },
  async selfieSegmentation({image, target}) {
    const [realImage, realTarget]= [Resources.get(image?.canvas), Resources.get(target)];
    let mask = {};
    if (realTarget && realImage) {
      const {width, height} = realImage;
      if (width && height) {
        const results = await Mediapipe.selfieSegmentation(realImage, realTarget);
        const bitmap = results?.results?.segmentationMask;
        if (bitmap) {
          realTarget.width = width;
          realTarget.height = height;
          const ctx = realTarget.getContext('2d');
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(bitmap, 0, 0, width, height);
          mask = {canvas: target, stream: image?.stream, version: Math.random()};
          // Only overwrite existing pixels.
          ctx.globalCompositeOperation = 'source-in';
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(0, 0, width, height);
        }
      }
    }
    return mask;
  },
  //
  async faceMesh({image}) {
    await requireFaceMesh();
    const realCanvas = Resources.get(image?.canvas);
    let results = {};
    if (realCanvas) {
      results = await Mediapipe.faceMesh(realCanvas);
      results.image = {canvas: results?.canvas, stream: image?.stream, version: Math.random()};
    }
    return results;
  },
  //
  async clear({target}) {
    const realTarget = Resources.get(target);
    if (realTarget) {
      const ctx = realTarget.getContext('2d');
      ctx.clearRect(0, 0, realTarget.width, realTarget.height);
    }
  },
  async renderSticker({data, sticker, target, index}) {
    const faceLandmarks = data?.faceLandmarks ?? data?.multiFaceLandmarks?.[0];
    const realTarget = Resources.get(target);
    const realSticker = sticker ? Resources.get(sticker) : masque;
    const {width, height} = data ?? 0;
    if (faceLandmarks && realTarget && width && height) {
      Object.assign(realTarget, {width, height});
      const ctx = realTarget.getContext('2d');
      FaceMeshModel.renderSticker(ctx, {faceLandmarks}, realSticker, index);
    }
  },
  async renderFace({data, target}) {
    const faceLandmarks = data?.faceLandmarks ?? data?.multiFaceLandmarks?.[0];
    const realTarget = Resources.get(target);
    const {width, height} = data ?? 0;
    if (faceLandmarks && realTarget && width && height) {
      Object.assign(realTarget, {width, height});
      const ctx = realTarget.getContext('2d');
      FaceMeshModel.renderFace(ctx, {faceLandmarks});
    }
  },
  async renderHands({data, target}) {
    const realTarget = Resources.get(target);
    if (data && realTarget) {
      const ctx = realTarget.getContext('2d');
      FaceMeshModel.renderHands(ctx, data);
    }
  }
};

export const FaceMeshModel = {
  ...MediapipeClassifier,
  async faceMesh(image) {
    return this.classify(await this.getFaceMesh(), image);
  },
  async getFaceMesh() {
    await requireFaceMesh();
    const facemesh = new FaceMesh({locateFile});
    facemesh.setOptions({
      modelComplexity: 1, // 0, 1, 2
      smoothLandmarks: true, // reduce jitter in landmarks
      //enableSegmentation: true, // also produce segment mask
      //smoothSegmentation: true, // reduce jitter in segment mask
      //refineFaceLandmarks: true, // more detail in mouth and iris
      minDetectionConfidence: 0.5, // human detection thresholds
      minTrackingConfidence: 0.5
    });
    this.getFaceMesh = () => facemesh;
    return facemesh;
  },
  renderHands(ctx, {rightHandLandmarks, leftHandLandmarks}) {
    const radius = data => lerp(data.from.z, -0.15, .1, 10, 1);
    drawLandmarks(ctx, rightHandLandmarks, {
      color: 'white', fillColor: 'rgb(0,217,231)',
      lineWidth: 1, radius
    });
    drawLandmarks(ctx, leftHandLandmarks, {
      color: 'white', fillColor: 'rgb(217,231,0)',
      lineWidth: 1, radius
    });
  },
  renderFace(ctx, {faceLandmarks}) {
    const h = mpHolistic;
    const dc = (...args) => drawConnectors(ctx, faceLandmarks, ...args);
    dc(h.FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
    dc(h.FACEMESH_RIGHT_EYE, {color: 'rgb(0,217,231)'});
    dc(h.FACEMESH_RIGHT_EYEBROW, {color: 'rgb(0,217,231)'});
    dc(h.FACEMESH_LEFT_EYE, {color: 'rgb(255,138,0)'});
    dc(h.FACEMESH_LEFT_EYEBROW, {color: 'rgb(255,138,0)'});
    dc(h.FACEMESH_FACE_OVAL, {color: '#E0E0E0', lineWidth: 5});
    dc(h.FACEMESH_LIPS, {color: '#E0E0E0', lineWidth: 5});
  },
  renderSticker(ctx, {faceLandmarks}, sticker, index) {
    if (faceLandmarks) {
      // find a centroid between the eybrows
      const {FACEMESH_LEFT_EYEBROW: LEB} = mpHolistic;
      const p0 = faceLandmarks?.[LEB[LEB.length-1]?.[0] || 0];
      const {FACEMESH_RIGHT_EYEBROW: REB} = mpHolistic;
      const p1 = faceLandmarks?.[REB[REB.length-1]?.[0] || 0];
      const [x, y, z] = [(p0.x+p1.x)/2, (p0.y+p1.y)/2, (p0.z+p1.z)/2];
      //const {x, y, z} = faceLandmarks[index] || {x:0,y:0,z:0};
      // map sticker to centroid
      const [sx, sy] = [x*ctx.canvas.width, y*ctx.canvas.height];
      // resize sticker
      const depth = lerp(z, -0.15, .1, 10, 1);
      const size = depth / scalar;
      const [sw, sh] = [sticker.width*size, sticker.height*size];
      // offset to top-left sticker corner
      const [cx, cy] = [sw/2, sh/2];
      ctx.drawImage(sticker, sx-cx, sy-cy, sw, sh);
    }
  }
};
