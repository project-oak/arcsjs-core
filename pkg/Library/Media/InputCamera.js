({
async update({image, frequency}, state, {output, service}) {
  if (image?.url && !image.canvas && state.image?.url !== image.url) {
    state.image = image;
    image.canvas = await service(({kind: 'ThreejsService', msg: 'canvasFromImage', data: {url: image?.url}}));
    output({image});
  }
  if (state.streaming) {
    //const freq = (101 - Math.round(frequency)) * 10;
    const freq = 0;
    await this.strobe(freq, state);
  }
},
async strobe(frequency, state) {
  if (frequency) {
    await timeout(() => {}, frequency);
  }
  // rendering will flush this value to the video-view, which should snap
  state.version = ((Number(state.version) || 0) + 1) % 1000;
},
render({image: inImage}, {streaming, version}) {
  return {
    videoNotImage: Boolean(streaming).toString(),
    image: inImage,
    box: {xCenter: 0.5, yCenter: 0.5, width: 1, height: 1},
    version
  };
},
onStream({eventlet: {value: streaming}, image}, state, {invalidate}) {
  state.streaming = streaming;
  invalidate();
},
onSnap({eventlet: {value: ref}, image}, state, {invalidate}) {
  invalidate();
  return {
    image: {
      ...image,
      canvas: ref,
      version: state.version
    }
  };
},
template: html`
<style>
  :host {
    position: relative;
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    background-color: black;
    color: #eee;
    overflow: hidden;
    /*
    min-width: 240px;
    min-height: 300px;
    */
  }
  video-view, image-resource {
    object-fit: contain;
  }
  icon {
    position: absolute;
    top: 2px;
    left: 4px;
    font-size: 12px;
  }
</style>

<div flex rows>
  <icon>videocam</icon>
  <!-- <div toolbar>
    <icon>videocam</icon>
  </div> -->
  <video-view flex show$="{{videoNotImage}}" version="{{version}}" box="{{box}}" on-snap="onSnap" on-stream="onStream"></video-view>
  <image-resource center flex hide$="{{videoNotImage}}" image="{{image}}"></image-resource>
</div>

`
});
