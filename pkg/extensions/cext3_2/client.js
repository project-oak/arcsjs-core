const SCENE_NAMES = {
    Sound: 'Sound (default)',
};

const APP_SETTINGS = {
    targetFPSInMs: 1000 / 30,
    fetchMeetCaptionFPSInMs: 1000 / 5,
    initialScene: 'Default',
    delayToRunFirstSceneMs: 1000,
    cameraWidth: 1280,
    cameraHeight: 720,
    downSamplingRatio: 0.67,
    virtualCameraDeviceId: 'virtual',
    virtualCameraGroupId: 'Virtual',
    virtualCameraLabel: 'Virtual Camera',
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

function getDeviceId(videoConstraints) {
    if (typeof videoConstraints === 'boolean')
        return null;
    if (!videoConstraints.deviceId)
        return null;
    if (typeof videoConstraints.deviceId === 'string') {
        return videoConstraints.deviceId;
    }
    if (videoConstraints.deviceId instanceof Array) {
        return videoConstraints.deviceId[0];
    }
    return videoConstraints.deviceId.exact ?? null;
}

let virtualTrack = null;

function fetchGoogleMeetCaptions() {
    let captions = '';
    let selfCaptions = '';
    let allCaptions = '';
    const gMeetCaptionsView = document.querySelector('div[jscontroller="yQffFe"]');
    if (gMeetCaptionsView) {
        const divs = document.querySelectorAll('div[class="TBMuR bj4p3b"]');
        for (const div of divs) {
            let name = div.querySelector('div[class="zs7s8d jxFHg"]').textContent;
            let wordSpans = Array.from(div.querySelectorAll('span'));
            captions += name + ': ';
            const sentence = wordSpans.map(span => span.textContent.trim()).join(' ');
            if (name === 'You' || name.indexOf('Presentation') !== -1) {
                if (selfCaptions.length > 0) {
                    selfCaptions += ' ';
                }
                selfCaptions += sentence;
            }
            captions += sentence + '\n';
            allCaptions += sentence;
        }
    }
    window.postMessage({
        type: MESSAGE_TYPES.setCaptions,
        captionsEnabled: Boolean(gMeetCaptionsView),
        captions,
        selfCaptions,
        allCaptions,
        outgoing: true,
    }, '*');
    //setTimeout(fetchGoogleMeetCaptions, APP_SETTINGS.fetchMeetCaptionFPSInMs);
}

function makeStreamFromTrack(track) {
    const stream = new MediaStream();
    stream.addTrack(track);
    return stream;
}

async function getVirtualMediaStream(constraints) {
    if (virtualTrack)
        return makeStreamFromTrack(virtualTrack);
    virtualTrack = await new Promise(resolve => {
        const signature = Math.trunc(performance.now());
        const rtcConnection = new RTCPeerConnection();
        const windowMessageListener = async (event) => {
            const message = event.data;
            if (!message.incoming || message.signature !== signature)
                return;
            switch (message.type) {
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
                case MESSAGE_TYPES.rtcIce:
                    await rtcConnection.addIceCandidate(message.candidate);
                    break;
                default:
                    console.warn(`Unsupported message type: ${message.type}.`);
            }
        };
        window.addEventListener('message', windowMessageListener);
        rtcConnection.addEventListener('track', (event) => {
            const track = event.track;
            track.applyConstraints = async () => { };
            track.clone = () => track;
            track.stop = () => {
                MediaStreamTrack.prototype.stop.call(track);
                virtualTrack = null;
                rtcConnection.close();
                window.postMessage({
                    type: MESSAGE_TYPES.closeStream,
                    outgoing: true,
                    signature,
                }, '*');
            };
            window.removeEventListener('message', windowMessageListener);
            resolve(track);
        });
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
        window.postMessage({ type: MESSAGE_TYPES.getStream, constraints, outgoing: true, signature }, '*');
    });
    return makeStreamFromTrack(virtualTrack);
}

function patchNativeAPI() {
    navigator.mediaDevices.getUserMedia = async function (constraints) {
        if (!constraints)
            return null;
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
    navigator.mediaDevices.dispatchEvent(new CustomEvent('devicechange'));
}

const ARCHAT_STYLES_ID = 'archat-styles';

function removeVideoMirrorMode() {
    if (document.getElementById(ARCHAT_STYLES_ID))
        return;
    const styles = `
    video {
      transform: unset !important;
    }
  `;
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    styleSheet.setAttribute('id', ARCHAT_STYLES_ID);
    document.head.appendChild(styleSheet);
}

function restoreVideoMirrorMode() {
    const styleSheet = document.getElementById(ARCHAT_STYLES_ID);
    if (styleSheet) {
        styleSheet.parentNode.removeChild(styleSheet);
    }
}

patchNativeAPI();
fetchGoogleMeetCaptions();
