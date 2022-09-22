/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 ({
  template: html`
  <style>
    #a_frame {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 320px;
      height: 240px;
    }
    a-scene {
      /* position: absolute;
      bottom: 0;
      left: 0;
      width: 320px;
      height: 240px; */
      /* background-color: black;
      color: #eee; */
      overflow: hidden;
      /* width: 240px;
      height: 300px;
      padding: 8px;
      border-radius: 8px; */
    }
  </style>
  <a-scene flex embedded>
    <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
    <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
    <a-sky color="#ECECEC"></a-sky>
  </a-scene>
  `
  });
