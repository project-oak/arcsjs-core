/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../Core/core.js';
import {Resources} from '../App/Resources.js';
import {ThreejsService} from '../Threejs/ThreejsService.js';
import {requireImage} from '../Media/ImageLoader.js';

const log = logFactory(logFactory.flags.TensorFlowService, 'TensorFlowService', 'coral');

// monostate data

const tf = globalThis.tf ?? {};
const bodySegmentation = globalThis.bodySegmentation ?? {};
const classifiers = {};
const customModels = {};

export class TensorFlowService  {
  // linkage with Particles
  static async receive({msg, data}) {
    log('receive', msg, data);
    try {
      if (this[msg]) {
        return (this[msg])(data);
      } else {
        log.warn(`no handler for "${msg}"`);
      }
    } catch (e) {
      log.warn(e.toString());
    }
  }
  static async requireCanvasAndModel(image, modelKind, modelUrl) {
    const canvasResource = requireImage(image);
    if (canvasResource) {
      // get values that resolve to dependencies
      const tasks = [
        canvasResource,
        this.requireModel(modelKind, modelUrl),
      ];
      // wait for dependencies (in parallel)
      const [canvas, model] = await Promise.all(tasks);
      return {canvas, model};
    }
    return {};
  }
  static async invokeModel({modelKind, modelUrl, imageRef}) {
    const {canvas, model} = await this.requireCanvasAndModel(imageRef, modelKind, modelUrl);
    if (canvas && model) {
      log('invokeModel', {imageRef, modelUrl});
      // if dependencies are satisfied
      if (model && canvas && canvas.width && canvas.height) {
        // perform the classification
        return await model.invoke(canvas);
      }
    }
  }
  static async toBinaryMask({segmentation}) {
    const coloredPartImage = await bodySegmentation.toBinaryMask(segmentation);
    return this.drawMask(coloredPartImage);
  }
  static async toColoredMask({segmentation}) {
    const coloredPartImage = await bodySegmentation.toColoredMask(
      segmentation,
      bodySegmentation.bodyPixMaskValueToRainbowColor,
      {r: 255, g: 255, b: 255, a: 255}
    );
    return this.drawMask(coloredPartImage);
  }
  static async drawMask(coloredPartImage) {
    if (!this.segmenterCanvas) {
      this.segmenterCanvas = ThreejsService.allocateCanvas();
    }
    const handle = await this.segmenterCanvas;
    const canvas = Resources.get(handle);
    const img = new Image();
    // TODO(sjmiles): repair sizing
    img.width = 640; //canvas.width;
    img.height = 480; //canvas.height;
    bodySegmentation.drawMask(canvas, img, coloredPartImage, 0.7, 0, false);
    return handle;
  }
  //
  //
  static async toolClassify({modelKind, modelUrl, imageRef}) {
    const canvas = requireImage(imageRef);
    if (canvas) {
      log('toolClassify', {imageRef, modelUrl});
      // start asynchronous tasks to marshal dependencies
      const tasks = [
        this.requireModel(modelKind, modelUrl),
        canvas
      ];
      // wait for tasks to complete (in parallel)
      const [tool, image] = await Promise.all(tasks);
      // if dependencies are satisfied
      if (tool && image && image.width && image.height) {
        // perform the classification
        const classes = await tool.classify(image);
        // send back processed results
        return this.getResultTranche(classes);
      }
    }
  }
  static async requireModel(kind, modelUrl) {
    const key = `${kind}:${modelUrl}`;
    if (!classifiers[key]) {
      classifiers[key] = this.loadModel(kind, modelUrl);
    }
    return classifiers[key];
  }
  static async loadModel(kind, modelUrl) {
    log.groupCollapsed(`Model Loader Messages`);
    log(`loading model... [${modelUrl}]`);
    await import(modelUrl);
    let classifierPromise;
    switch (kind) {
      case 'bodySegmentation': {
        const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
        const segmenterConfig = {
          runtime: 'tfjs', //'mediapipe'
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
          modelType: 'general'
        };
        classifierPromise = (async () => {
          const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
          const tool = {
            kind,
            segmenter,
            invoke: canvas => segmenter.segmentPeople(canvas)
          };
          log(tool);
          return tool;
        })();
        // classifierPromise = new Promise(async resolve => {
        //   const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
        //   const tool = {
        //     segmenter,
        //     invoke: canvas => segmenter.segmentPeople(canvas)
        //   };
        //   log(kind, tool);
        //   resolve(tool);
        // });
      }
      break;
      // case 'faceLandmarksDetection': { }
      // break;
      default: {
        const tool = globalThis.mobilenet;
        log(kind, tool);
        classifierPromise = tool?.load();
      }
      break;
    }
    console.time('tfjs-load');
    await classifierPromise;
    console.timeEnd('tfjs-load');
    log.groupEnd();
    return classifierPromise;
  }
  static async getResultTranche(classes) {
    const results = classes?.slice(0, 3);
    log('classification complete', results);
    const output = results?.map(cls => ({
      displayName: cls.displayName ?? cls.className,
      score: cls.probability
    }));
    //const result = output.shift();
    // if (result?.score > 0.35) {
    //   outputText = result.displayName;
    // }
    return output;
  }
  static async removeModel(kind, modelUrl) {
    const key = `${kind}:${modelUrl}`;
    let classifier = classifiers[key];
    if (classifier) {
      await classifier.cleanUp();
      classifiers[key] = null;
    }
  }
  //
  //
  //
  static async cropAndResize({
    tensorId,
    cropRegion,
    size,
    existingTensorId
  }) {
    const tensor = Resources.get(tensorId);
    if (tensor) {
      // For target resize size, first try using the given size. If not
      // available, use the crop region size. If not available, use the original
      // size of the tensor.
      //
      // This assumes that the tensor has a shape of
      // [1, height, width, channel].
      const width = tensor.shape[2];
      const height = tensor.shape[1];
      const resizeWidth = size ?
          Math.floor(size.width) :
          (cropRegion ? Math.floor(cropRegion.xMax - cropRegion.xMin) : width);
      const resizeHeight = size ?
          Math.floor(size.height) :
          (cropRegion ? Math.floor(cropRegion.yMax - cropRegion.yMin) : height);
      let cropRegionValues = [0, 0, 1, 1];
      if (cropRegion) {
        cropRegionValues = [
          cropRegion.yMin / height, cropRegion.xMin / width,
          cropRegion.yMax / height, cropRegion.xMax / width
        ];
      }

      const outputTensor = tf.tidy(() => {
        return tf.image.cropAndResize(
            tensor,
            tf.tensor2d(cropRegionValues, [1, 4]),
            tf.tensor1d([0], 'int32'), [resizeHeight, resizeWidth]);
      });
      return this.storeTensorInResources(existingTensorId, outputTensor);
    }
  }
  //
  //
  //
  static async imageToTensor({image, existingTensorId}) {
    const canvas = await requireImage(image);
    if (canvas?.width > 0 && canvas?.height > 0) {
      const outputTensor = tf.tidy(()=>{
        const imgTensor = tf.browser.fromPixels(canvas);
        return tf.expandDims(imgTensor);
      });
      return this.storeTensorInResources(existingTensorId, outputTensor);
    }
  }
  //
  //
  //
  static async remapValueRange({
    tensorId,
    fromRangeMin,
    fromRangeMax,
    toRangeMin,
    toRangeMax,
    existingTensorId
  }) {
    const tensor = Resources.get(tensorId);
    if (tensor) {
      const outputTensor = tf.tidy(() => {
        const {scale, offset} = this.transformValueRange(
            fromRangeMin, fromRangeMax, toRangeMin, toRangeMax);
        return tf.add(tf.mul(tensor, scale), offset);
      });
      return this.storeTensorInResources(existingTensorId, outputTensor);
    }
  }
  static transformValueRange(fromMin, fromMax, toMin, toMax) {
    const fromRange = fromMax - fromMin;
    const ToRange = toMax - toMin;
    const scale = ToRange / fromRange;
    const offset = toMin - fromMin * scale;
    return {scale, offset};
  }
  //
  //
  //
  static async runCustomModel({tensorId, modelUrl, existingTensorId}) {
    const tasks = [
      Resources.get(tensorId),
      this.requireCustomModel(modelUrl)
    ];
    const [tensor, model] = await Promise.all(tasks);
    if (model && tensor) {
      try {
        const outputTensor = await model.executeAsync(tensor);
        return this.storeTensorInResources(existingTensorId, outputTensor);
      } catch(e) {
        // TODO(jingjin): handle errors better.
        console.warn(e);
      }
    }
  }
  static async requireCustomModel(modelUrl) {
    const key = `${modelUrl}`;
    if (!customModels[key]) {
      customModels[key] = await this.loadCustomModel(modelUrl);
    }
    return customModels[key];
  }
  static async loadCustomModel(modelUrl) {
    // TODO(jingjin): support layers model.
    const fromTFHub = modelUrl.includes('https://tfhub.dev');
    return await tf.loadGraphModel(modelUrl, {fromTFHub});
  }
  //
  //
  //
  static async constToTensor({data, shape, existingTensorId}) {
    // TODO(jingjin): add support for dtypes other than float.
    const tensor = tf.tensor(data, shape);
    return this.storeTensorInResources(existingTensorId, tensor);
  }
  //
  //
  //
  static async binaryOp({tensor0Id, tensor1Id, op, existingTensorId}) {
    const tensor0 = Resources.get(tensor0Id);
    const tensor1 = Resources.get(tensor1Id);
    const opFn = tf[op];
    if (tensor0 && tensor1 && opFn) {
      const tensor = opFn(tensor0, tensor1);
      return this.storeTensorInResources(existingTensorId, tensor);
    }
  }
  //
  //
  //
  static async clipByValue({tensorId, min, max, existingTensorId}) {
    const tensor = Resources.get(tensorId);
    if (tensor) {
      const outputTensor = tf.clipByValue(tensor, min,  max);
      return this.storeTensorInResources(existingTensorId, outputTensor);
    }
  }
  //
  //
  //
  static async tensorToDepthMap({tensorId, existingDepthMapId}) {
    const tensor = Resources.get(tensorId);
    if (tensor && tensor.shape.length === 4) {
      const outputTensor = tf.squeeze(tensor, [0, 3]);
      if (existingDepthMapId) {
        const existingDepthMap = Resources.get(existingDepthMapId);
        if (existingDepthMap) {
          existingDepthMap.toTensor().dispose();
        }
      }
      const depthMapId = existingDepthMapId || Resources.newId();
      Resources.set(depthMapId, {
        toTensor: () => outputTensor
        // TODO(jingjin): implement other DepthMap interface methods as needed.
      });
      return depthMapId;
    }
  }
  //
  //
  //
  static async preprocessImage(
      {image, resize, normalize, expandDim, existingTensorId}) {
    const canvas = await requireImage(image);
    if (canvas?.width > 0 && canvas?.height > 0) {
      const outputTensor = tf.tidy(() => {
        // Image to tensor
        //
        let tensor = tf.browser.fromPixels(canvas);
        // Expend dim.
        //
        if (expandDim) {
          tensor = tf.expandDims(tensor);
        }
        // Resize.
        //
        // For target resize size, first try using the given size. If not
        // available, use the original size of the tensor.
        //
        // This assumes that the tensor has a shape of
        // [1, height, width, channel].
        if (resize?.width > 0 && resize?.height > 0) {
          const width = tensor.shape[2];
          const height = tensor.shape[1];
          const resizeWidth = resize ? Math.floor(resize.width) : width;
          const resizeHeight = resize ? Math.floor(resize.height) : height;
          tensor = tf.image.resizeBilinear(
              tensor, [Math.floor(resizeHeight), Math.floor(resizeWidth)]);
        }
        // Normalize.
        //
        if (normalize) {
          const {fromRangeMin, fromRangeMax, toRangeMin, toRangeMax} =
              normalize;
          if (fromRangeMin !== toRangeMin || fromRangeMax !== toRangeMax) {
            const {scale, offset} = this.transformValueRange(
                fromRangeMin, fromRangeMax, toRangeMin, toRangeMax);
            tensor = tf.add(tf.mul(tensor, scale), offset);
          }
        }
        return tensor;
      });
      return this.storeTensorInResources(existingTensorId, outputTensor);
    }
  }
  //
  //
  //
  static async postprocessDepthModel({tensorId, size, config, existingTensorId}) {
    const tensor = Resources.get(tensorId);
    if (tensor) {
      const outputTensor = tf.tidy(() => {
        // Divided by 2.
        //
        let outputTensor = tf.div(tensor, tf.scalar(2));
        // Remap to min/max depth
        //
        const {scale, offset} = this.transformValueRange(
            0, 1, config.minDepth, config.maxDepth);
        outputTensor = tf.add(tf.mul(outputTensor, scale), offset);
        // Clip to [0, 1]
        //
        outputTensor = tf.clipByValue(outputTensor, 0,  1);
        // Resize to the size of the original image.
        //
        if (size) {
          outputTensor = tf.image.resizeBilinear(
              outputTensor, [Math.floor(size.height), Math.floor(size.width)]);
        }
        return outputTensor;
      });
      return this.storeTensorInResources(existingTensorId, outputTensor);
    }
  }
  //
  //
  //
  static storeTensorInResources(existingTensorId, tensor) {
    // Dispose existing tensor if existed.
    if (existingTensorId) {
      const existingTensor = Resources.get(existingTensorId);
      if (existingTensor) {
        existingTensor.dispose();
      }
    }
    // Allocate a resource id (if necessary) and store the given tensor with
    // the id.
    const tensorId = existingTensorId || Resources.newId();
    Resources.set(tensorId, tensor);
    return tensorId;
  }
  // TODO(jingjin): move rapsai specific functions to another service hosted in
  // rapsai-core.
}
