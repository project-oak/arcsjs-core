/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

let connections = {};

export const initRtc = (requestMediaStream) => {
  chrome.runtime.onConnect.addListener(port => {
    console.log('web-rtc: port connected');
    // Most likely client tab was closed.
    port.onDisconnect.addListener(() => {
      console.log('web-rtc: port disconnect');
      //globalClientCounter -= rtcConnections.size;
      connections = {};
      //maybeStopEngine();
    });
    port.onMessage.addListener(async message => {
      //console.log('web-rtc: received', message);
      // Client can send an optional signature. This way we can distinguish
      // between different camera requests. If unset, it defaults to 0.
      const signature = message.signature ?? 0;
      const connection = connections[signature];
      switch (message.type) {
        // stream is requested
        case 'GET_STREAM':
          getStream(port, requestMediaStream, signature);
          break;
        // received an answer
        case 'RTC_ANSWER':
          console.log('web-rtc: received', message);
          await connection?.setRemoteDescription(message.description);
          break;
        // received ICE candidate info
        case 'RTC_ICE':
          console.log('web-rtc: received', message);
          await connection?.addIceCandidate(message.candidate);
          break;
        // cient closed the stream
        case 'CLOSE_STREAM':
          if (connection) {
            connection.close();
            connections[signature] = null;
          }
          break;
      }
    });
  });
};

const offerOptions = {
  offerToReceiveVideo: true,
};

const getStream = async (port, requestMediaStream, signature) => {
  //console.log('web-rtc: creating stream connection');
  const stream = await requestMediaStream();
  // create connection
  const connection = new RTCPeerConnection();
  connections[signature] = connection;
  //console.log(signature, connection);
  //
  // add output stream tracks
  for (const track of stream.getTracks()) {
    //console.log('web-rtc: added a track', track);
    connection.addTrack(track);
  }
  //
  // create offer
  const offer = await connection.createOffer(offerOptions);
  await connection.setLocalDescription(offer);
  //console.log('web-rtc: created an offer');
  //
  // forward ICE candidate info when it becomes available
  connection.addEventListener('icecandidate', (event) => {
    //console.log('web-rtc: received icecandidate', event.candidate);
    if (event.candidate) {
      rtcIce(port, event.candidate, signature);
    }
  });
  //console.log('web-rtc: sent an offer', offer);
  // send offer
  rtcOffer(port, offer, signature);
};

const msg = (port, type, fields) => {
  const msg = {type, ...fields};
  //console.log('web-rtc: sending to client:', msg);
  port.postMessage(msg);
};

const rtcIce = (port, candidate, signature) => msg(port, 'RTC_ICE', {candidate, signature});
const rtcOffer = (port, description, signature) => msg(port, 'RTC_OFFER', {description, signature});
