/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../../arcsjs-support.js';

const log = logFactory(true, 'TensorFlowLiteService', 'coral');

let {tflite} = globalThis;

const moduleRef = globalThis.TensorFlowModuleRef || import.meta.url.split('/').slice(0, -1).join('/');

const classifiers = {};

class ImageJunk {
  static async loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

export class TensorFlowLiteService extends ImageJunk {
  static async receive({msg, data}) {
    if (!tflite) {
      await import(`./tf-tflite/tf-tflite.min.js`);
      tflite = window.tflite;
    }
    if (tflite) {
      tflite.setWasmPath(`${moduleRef}/tf-tflite/`);
      return TensorFlowLiteService[msg]?.(data);
    }
  }
  static async requireModel(kind, tfliteModelUrl) {
    const key = `${kind}:${tfliteModelUrl}`;
    if (!classifiers[key]) {
      log.groupCollapsed(`TfLite.${kind} Model Loader Messages`);
      log(`loading model... [${tfliteModelUrl}]`);
      console.time('load');
      //classifiers[key] = fetch(tfliteModelUrl);
      classifiers[key] = tflite[kind].create(tfliteModelUrl, {maxResults: 3});
      await classifiers[key];
      console.timeEnd('load');
      log.groupEnd();
    }
    return await classifiers[key];
  }
  static async removeModel(kind, tfliteModelUrl) {
    const key = `${kind}:${tfliteModelUrl}`;
    let classifier = classifiers[key];
    if (classifier) {
      await classifier.cleanUp();
      classifiers[key] = null;
    }
  }
  static async taskClassify({modelUrl, imageRef}) {
    log('taskClassify', imageRef, modelUrl);
    const tasks = [
      this.requireModel('ImageClassifier', modelUrl),
      this.loadImage(imageRef)
    ];
    const [tool, image] = await Promise.all(tasks);
    if (tool) {
      const classes = await tool.classify(image);
      const results = classes?.slice(0, 3);
      log('classification complete', results);
      return results?.map(cls => {
        return {
          displayName: cls.displayName ?? cls.className,
          score: cls.probability,
        };
      });
    }
  }
  static async taskDetect({modelUrl, imageRef}) {
    const tasks = [this.requireModel('ObjectDetector', modelUrl), this.loadImage(imageRef)];
    const [tool, image] = await Promise.all(tasks);
    if (tool) {
      // log(`ObjectDetector.detect...`);
      // console.time('detection');
      const classes = await tool.detect(image);
      // console.timeEnd('detection');
      const results = classes?.slice(0, 3);
      return results;
    }
  }
}