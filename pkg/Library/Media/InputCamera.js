({
render({frequency, stream}, {version}) {
  return {
    frequency,
    stream,
    videoNotImage: Boolean(stream).toString()
  };
},
onCanvas({eventlet: {value: ref}}) {
  return {
    image: {
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
