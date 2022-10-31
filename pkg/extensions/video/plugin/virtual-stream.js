/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
let virtualTrack;
let signature;
let connection;

const send = (type, props) => {
  console.log('virtual-stream: sending', type, props);
  window.postMessage({type, ...props, outgoing: true, signature}, '*');
};

const getVirtualMediaStream = async (constraints) => {
  if (!virtualTrack) {
    virtualTrack = await createVirtualTrack(constraints);
  }
  if (virtualTrack) {
    const stream = new MediaStream();
    stream.addTrack(virtualTrack);
    return stream;
  }
};

const createVirtualTrack = async (constraints) => {
  return await new Promise(resolve => {
    // make a signature out of some entropy
    signature = Math.trunc(performance.now());
    // create an actual rtc thing
    connection = new RTCPeerConnection();
    // rtc listeners
    connection.addEventListener('icecandidate', onIceCandidate);
    connection.addEventListener('track', e => onTrack(resolve, e));
    // command listener
    window.addEventListener('message', messageListener);
    // send request to background
    console.log('sending GET_STREAM');
    send('GET_STREAM', {constraints});
  });
};

const messageListener = async ({data: msg}) => {
  if (msg.incoming && msg.signature === signature) {
    console.log('virtual-stream received:', msg.type);
    switch (msg.type) {
      case 'RTC_OFFER':
        return acceptOffer(msg);
      case 'RTC_ICE':
        return acceptIce(msg);
    }
  }
};

const acceptOffer = async ({description}) => {
  await connection.setRemoteDescription(description);
  const answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
  send('RTC_ANSWER', {description: new RTCSessionDescription(answer).toJSON()});
};

const acceptIce = async ({candidate}) => {
  await connection.addIceCandidate(candidate);
};

const onIceCandidate = (event) => {
  if (event.candidate) {
    const candidate = event.candidate.toJSON();
    send('RTC_ICE', {candidate});
  }
};

const onTrack = (resolve, event) => {
  console.log('onTrack', event);
  // why here??
  //window.removeEventListener('message', windowMessageListener);
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
    connection.close();
    // notify upstream
    send('CLOSE_STREAM');
  }
  console.log('onTrack resolving with:', track);
  // finally, here's the track!
  resolve(track);
};

globalThis.createVirtualCamera(getVirtualMediaStream);
