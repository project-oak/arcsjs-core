/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import './tesseract.min.js';

const workers = {};
 
export class TesseractService {
  static async receive({msg, data}) {
    return this[msg]?.(data);
  }
  static async loadImage(src) {
    const loaded = (resolve, img) => {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      img.onload = () => resolve(img);
      img.src = canvas.toDataURL();
    };
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => loaded(resolve, img);
      img.onerror = reject;
      img.src = src;
    });
  }
  static async requireWorker(lang) {
    let worker = workers[lang];
    if (!worker) {
      worker = await Tesseract.createWorker();
      await worker.load();
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
    }
    return worker;
  }
  static async recognize(src) {
    // TODO(mbrenon): let user select language
    const tasks = [this.requireWorker('eng'), this.loadImage(src)];
    const [worker, image] = await Promise.all(tasks);
    return new Promise((resolve, reject) => {
      worker.recognize(image).then((result) => {
        console.log(result);
        resolve(result.data ? [result.data.text] : null);
      }).catch((e) => {
        console.log(e);
        resolve(null);
      });
    });
  } 
}