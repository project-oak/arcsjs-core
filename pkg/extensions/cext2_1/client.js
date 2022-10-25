const APP_SETTINGS = {
  virtualCameraDeviceId: 'virtual',
  virtualCameraGroupId: 'ARChat',
  virtualCameraLabel: 'ARChat Virtual Camera'
};

const MESSAGE_TYPES = {
  getStream: 'GET_STREAM',
  closeStream: 'CLOSE_STREAM',
  rtcAnswer: 'RTC_ANSWER',
  rtcIce: 'RTC_ICE',
  rtcOffer: 'RTC_OFFER',
  setScene: 'SET_SCENE',
  setCaptions: 'SET_CAPTIONS',
  setImage: 'SET_IMAGE',
  callLaMDA: 'CALL_LAMDA',
  getCurrentScene: 'GET_CURRENT_SCENE',
  currentScene: 'CURRENT_SCENE',
};

let virtualTrack = null;

function makeStreamFromTrack(track) {
  const stream = new MediaStream();
  stream.addTrack(track);
  return stream;
}

async function getVirtualMediaStream(constraints) {
  if (virtualTrack) {
    return makeStreamFromTrack(virtualTrack);
  }
  //
  virtualTrack = await new Promise(resolve => {
    // make a signature out of some entropy
    const signature = Math.trunc(performance.now());
    // create an actual rtc thing
    const rtcConnection = new RTCPeerConnection();
    // command listener
    const windowMessageListener = async (event) => {
      // bail on messages not for us
      const message = event.data;
      if (!message.incoming || message.signature !== signature)
        return;
      // dispatch rtcOffer or rtcIce
      switch (message.type) {
        //
        case MESSAGE_TYPES.rtcOffer:
          await rtcConnection.setRemoteDescription(message.description);
          const answer = await rtcConnection.createAnswer();
          await rtcConnection.setLocalDescription(answer);
          window.postMessage({
            type: MESSAGE_TYPES.rtcAnswer,
            description: new RTCSessionDescription(answer).toJSON(),
            outgoing: true,
            signature
          }, '*');
          break;
        //
        case MESSAGE_TYPES.rtcIce:
          await rtcConnection.addIceCandidate(message.candidate);
          break;
        //
        default:
          console.warn(`Unsupported message type: ${message.type}.`);
        }
      };
      //
      //window.addEventListener('message', windowMessageListener);
      //
      // rtc listeners
      rtcConnection.addEventListener('icecandidate', (event) => {
        if (!event.candidate)
          return;
        window.postMessage({
          type: MESSAGE_TYPES.rtcIce,
          candidate: event.candidate.toJSON(),
          outgoing: true,
          signature
        }, '*');
      });
      rtcConnection.addEventListener('track', (event) => {
        // why here??
        window.removeEventListener('message', windowMessageListener);
        // get a new track
        const track = event.track;
        // mess with the API (adding or modifying?)
        track.applyConstraints = async () => {};
        track.clone = () => track;
        track.stop = () => {
          // I guess it's not a real boy?
          MediaStreamTrack.prototype.stop.call(track);
          virtualTrack = null;
          // stop track === close connection
          rtcConnection.close();
          // notify upstream
          window.postMessage({
            type: MESSAGE_TYPES.closeStream,
            outgoing: true,
            signature,
          }, '*');
        };
        // finally, here's the track!
        resolve(track);
      });
      //
      window.postMessage({type: MESSAGE_TYPES.getStream, constraints, outgoing: true, signature}, '*');
  });
  return makeStreamFromTrack(virtualTrack);
}

/* */

function getDeviceId(videoConstraints) {
  if (typeof videoConstraints === 'boolean') {
    return null;
  }
  if (!videoConstraints.deviceId) {
    return null;
  }
  if (typeof videoConstraints.deviceId === 'string') {
    return videoConstraints.deviceId;
  }
  if (videoConstraints.deviceId instanceof Array) {
    return videoConstraints.deviceId[0];
  }
  return videoConstraints.deviceId.exact ?? null;
}

function patchNativeAPI() {
  navigator.mediaDevices.getUserMedia = async function (constraints) {
    if (!constraints) {
      return null;
    }
    const videoDeviceId = constraints.video ? getDeviceId(constraints.video) : null;
    window.selectedCameraId = videoDeviceId;
    if (videoDeviceId !== 'virtual') {
      restoreVideoMirrorMode();
      return MediaDevices.prototype.getUserMedia.call(this, constraints);
    }
    else {
      removeVideoMirrorMode();
      const stream = await getVirtualMediaStream(constraints.video);
      if (constraints.audio) {
        const audioConstrains = { audio: constraints.audio, video: false };
        const audioStream = await MediaDevices.prototype.getUserMedia.call(this, audioConstrains);
        for (const track of audioStream.getAudioTracks()) {
          stream.addTrack(track);
        }
      }
      return stream;
    }
  };
  //
  navigator.mediaDevices.enumerateDevices = async function () {
    const devices = await MediaDevices.prototype.enumerateDevices.call(this);
    const virtualCamera = {
        deviceId: APP_SETTINGS.virtualCameraDeviceId,
        groupID: APP_SETTINGS.virtualCameraGroupId,
        kind: 'videoinput',
        label: APP_SETTINGS.virtualCameraLabel,
    };
    return [...devices, virtualCamera];
  };
  //
  navigator.mediaDevices.dispatchEvent(
    new CustomEvent('devicechange')
  );
}

// const ARCHAT_STYLES_ID = 'archat-styles';

// function removeVideoMirrorMode() {
//     if (document.getElementById(ARCHAT_STYLES_ID))
//         return;
//     const styles = `
//     video {
//       transform: unset !important;
//     }
//   `;
//     const styleSheet = document.createElement('style');
//     styleSheet.type = 'text/css';
//     styleSheet.innerText = styles;
//     styleSheet.setAttribute('id', ARCHAT_STYLES_ID);
//     document.head.appendChild(styleSheet);
// }
// function restoreVideoMirrorMode() {
//     const styleSheet = document.getElementById(ARCHAT_STYLES_ID);
//     if (styleSheet) {
//         styleSheet.parentNode.removeChild(styleSheet);
//     }
// }

patchNativeAPI();
//fetchGoogleMeetCaptions();
