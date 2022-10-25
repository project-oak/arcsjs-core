(() => {

const builtin = navigator.mediaDevices;
const fallback = MediaDevices.prototype;

let getVirtualMediaStream;

globalThis.patchMediaDevices = streamGetter => {
  getVirtualMediaStream = streamGetter;
  builtin.getUserMedia = getUserMedia;
  builtin.enumerateDevices = enumerateDevices;
  builtin.dispatchEvent(
    new CustomEvent('devicechange')
  );
};

globalThis.getStream = (constraints) => {
  console.log(constraints);
  const dom = (tag, props) => document.body.appendChild(Object.assign(document.createElement(tag), props));
  //const loadInPage = src => dom('script', {src});
  const canvas = dom('canvas', {width: 80, height: 60, style: 'position: absolute;'});
  const ctx = canvas.getContext('2d');
  setInterval(() => {
    ctx.fillStyle = ['red', 'white', 'blue'][Math.floor(Math.random()*3)];
    ctx.fillRect(20, 20, 30, 20);
  }, 50);
  return canvas.captureStream(10);
};

const enumerateDevices = async function () {
  const devices = await fallback.enumerateDevices.call(this);
  const virtualCamera = {
    deviceId: 'virtual',
    groupID: 'ArcsJs',
    kind: 'videoinput',
    label: 'ArcsJs Virtual Camera'
  };
  return [...devices, virtualCamera];
};

const getUserMedia = async function (constraints) {
  if (constraints) {
    const videoDeviceId = getDeviceId(constraints.video);
    //window.selectedCameraId = videoDeviceId;
    if (videoDeviceId === 'virtual') {
      return marshalVirtualStream(constraints);
    } else {
      //restoreVideoMirrorMode();
      return fallback.getUserMedia.call(this, constraints);
    }
  }
};

const marshalVirtualStream = async ({audio, video}) => {
  //removeVideoMirrorMode();
  const stream = await getVirtualMediaStream(video);
  if (audio) {
    const audioStream = await fallback.getUserMedia.call(this, {audio, video: false});
    for (const track of audioStream.getAudioTracks()) {
      stream.addTrack(track);
    }
  }
  return stream;
};

const getDeviceId = videoConstraints => {
  if (typeof videoConstraints === 'boolean') {
    return null;
  }
  if (!videoConstraints?.deviceId) {
    return null;
  }
  if (typeof videoConstraints.deviceId === 'string') {
    return videoConstraints.deviceId;
  }
  if (videoConstraints.deviceId instanceof Array) {
    return videoConstraints.deviceId[0];
  }
  return videoConstraints.deviceId.exact ?? null;
};

})();