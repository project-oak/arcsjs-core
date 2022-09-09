/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({src}) {
  //src="./Library/ModelViewer/Astronaut.glb"
  //src ??= './Library/ModelViewer/junk_yard_robot_boy/scene.gltf';
  //src ??= './Library/ModelViewer/Horse.glb';
  const root = './Library/ModelViewer/';
  //src ??= `${root}${['junk_yard_robot_boy/scene.gltf','Astronaut.glb', 'Horse.glb'][Math.floor(Math.random()*3)]}`;
  src ??= `${root}Astronaut.glb`;
  return {src};
},
template: html`
<style>
  :host {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    --poster-color: transparent;
  }
  model-viewer {
    width: unset;
    height: unset;
  }
</style>
<model-viewer
  flex
  src="{{src}}"
  alt="A 3D model"
  ar
  ar-modes="webxr scene-viewer quick-look"
  environment-image="neutral"
  auto-rotate
  camera-controls
  shadow-intensity="1"
  camera-target="1m 1m 0m"
></model-viewer>
`
});
