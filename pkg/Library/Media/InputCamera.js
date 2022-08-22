({
async update({image, stream, frequency}, state, {output, service}) {
  state.streaming = Boolean(stream);
},
render({frequency, image, stream}, {streaming, version}) {
  return {
    frequency,
    stream,
    videoNotImage: Boolean(streaming).toString(),
    image
  };
},
onCanvas({eventlet: {value: ref}, image}) {
  return {
    image: {
      //...image,
      canvas: ref,
      version: Math.random()
    }
  };
},
template: html`
<style>
  :host {
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    background-color: black;
    color: #eee;
    overflow: hidden;
    width: 240px;
    height: 300px;
  }
  video-view, image-resource {
    object-fit: contain;
  }
</style>

<div flex rows>
  <div toolbar>
    <icon>videocam</icon>
  </div>
  <stream-view flex show$="{{videoNotImage}}" stream="{{stream}}" frequency="{{frequency}}" on-canvas="onCanvas"></stream-view>
  <image-resource center flex hide$="{{videoNotImage}}" image="{{image}}"></image-resource>
</div>

`
});
