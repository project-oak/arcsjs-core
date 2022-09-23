const THREE = globalThis.THREE;
const equire = () => {};

// Builds the 3d glasses object from a GLB and lens materials.
const buildGlasses = (loader) => {
  const glasses = new THREE.Object3D();
  // add frame glb.
  loader.load(equire('./assets/Models/stereo-glasses.glb'), (glassesObj) => {
    glassesObj.scene.scale.set(1.1, 1.1, 1.1);
    glasses.add(glassesObj.scene);
  });
  // add left lens.
  const leftLens = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.25, 32),
    new THREE.MeshStandardMaterial({
      color: 0xFFC828,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.5,
      roughness: 0.25,
    })
  );
  leftLens.position.copy(new THREE.Vector3(-0.3, -0.01, 0));
  glasses.add(leftLens);
  // add right lens.
  const rightLens = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.25, 32),
    new THREE.MeshStandardMaterial({
      color: 0xAD50FF,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.5,
      roughness: 0.25,
    })
  );
  rightLens.position.copy(new THREE.Vector3(0.2, -0.01, 0));
  glasses.add(rightLens);
  return glasses;
}
// Builds a scene object with a mesh, an occluder, and sun glasses, and manages state updates to
// each component.
const buildHead = (modelGeometry) => {
  // head is anchored to the face.
  const head = new THREE.Object3D()
  head.visible = false
  // headMesh draws content on the face.
  const headMesh = XRExtras.ThreeExtras.faceMesh(
    modelGeometry,
    XRExtras.ThreeExtras.basicMaterial({
      tex: require('./assets/Tattoos/8-tat.png'),
      opacity: 0.8,
      alpha: require('./assets/Alpha/soft-eyes-mouth.png'),
    })
  )
  head.add(headMesh.mesh)
  // Glasses are attached to the nose at a slight offset.
  const loader = new THREE.GLTFLoader()
  const glasses = buildGlasses(loader)
  glasses.position.copy(new THREE.Vector3(0, 0.05, 0))
  const noseAttachment = new THREE.Object3D()
  noseAttachment.add(glasses)
  head.add(noseAttachment)
  // Add occluder.
  loader.load(require('./assets/Models/head-occluder.glb'), (occluder) => {
    occluder.scene.scale.set(1.1, 1.1, 1.4)
    occluder.scene.position.set(-0.02, 0, 0.25)
    occluder.scene.traverse((node) => {
      if (node.isMesh) {
        const mat = new THREE.MeshStandardMaterial()
        mat.colorWrite = false
        node.material = mat
      }
    })
    head.add(occluder.scene)
  })
  // Update geometry on each frame with new info from the face controller.
  const show = (event) => {
    const {transform, attachmentPoints} = event.detail
    // Update the overall head position.
    head.position.copy(transform.position)
    head.setRotationFromQuaternion(transform.rotation)
    head.scale.set(transform.scale, transform.scale, transform.scale)
    // Update the nose position.
    noseAttachment.position.copy(attachmentPoints.noseBridge.position)
    // Update the face mesh.
    headMesh.show(event)
    head.visible = true
  }
  // Hide all objects.
  const hide = () => {
    head.visible = false
    headMesh.hide()
  }
  return {
    object3d: head,
    show,
    hide,
  }
}
// Build a pipeline module that initializes and updates the three.js scene based on facecontroller
// events.
const faceScenePipelineModule = () => {
  // Start loading mesh url early.
  let canvas_
  let modelGeometry_
  let head_
  // init is called by onAttach and by facecontroller.faceloading. It needs to be called by both
  // before we can start.
  const init = ({canvas, detail}) => {
    if (head_) {
      return
    }
    canvas_ = canvas_ || canvas
    modelGeometry_ = modelGeometry_ || detail
    if (!(canvas_ && modelGeometry_)) {
      return
    }
    // Get the 3js scene from XR
    const {scene} = XR8.Threejs.xrScene()
    // sets render sort order to the order of objects added to scene (for alpha rendering).
    THREE.WebGLRenderer.sortObjects = false
    // add lights.
    const targetObject = new THREE.Object3D()
    targetObject.position.set(0, 0, -1)
    scene.add(targetObject)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.castShadow = true
    directionalLight.position.set(0, 0.25, 0)
    directionalLight.target = targetObject
    scene.add(directionalLight)
    const bounceLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5)
    scene.add(bounceLight)
    // head_ is anchored to the face.
    head_ = buildHead(modelGeometry_)
    scene.add(head_.object3d)
    // prevent scroll/pinch gestures on canvas.
    canvas_.addEventListener('touchmove', (event) => event.preventDefault())
  }
  const onDetach = () => {
    canvas_ = null
    modelGeometry_ = null
  }
  const show = (event) => head_.show(event)
  const hide = () => head_.hide()
  return {
    name: 'facescene',
    onAttach: init,
    onDetach,
    listeners: [
      {event: 'facecontroller.faceloading', process: init},
      {event: 'facecontroller.facefound', process: show},
      {event: 'facecontroller.faceupdated', process: show},
      {event: 'facecontroller.facelost', process: hide},
    ],
  }
}
export {faceScenePipelineModule}