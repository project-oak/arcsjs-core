import './peerjs.min.js';
import * as tryst from './tryst.js';

const {Peer} = globalThis;

let nid;
const calls = {};
const mediaConnections = {};
const me = new Peer();

const onopen = (id) => {
  nid = id;
  console.log('My peer ID is: ' + id);
};

// when connection to PeerServer is established, we receive our peerid
me.on('open', id => onopen(id));
// when a call comes in, answer it
me.on('call', mediaConnection => myself.answerCall(mediaConnection));

export const myself = {
  get me() {
    return me;
  },
  get nid() {
    return nid;
  },
  // the mediaStream that represents me
  // somebody else has to set it
  get mediaStream() {
    return this._mediaStream;
  },
  set mediaStream(stream) {
    this._mediaStream = stream;
    if (stream && !stream.active) {
      this.endStreamCall(stream);
    }
  },
  // look for folks who want to connect and call them
  async handshake(onstream) {
    myself.onstream = onstream;
    if (myself.mediaStream && myself.nid) {
      this.strangers = await tryst.meetStrangers(myself.nid);
      this.strangers.forAll(pid => pid && myself.maybeCall(pid, onstream));
    }
  },
  maybeCall: (them, onstream) => {
    if (myself.shouldCall(them)) {
      myself.doCall(them, onstream);
    }
  },
  shouldCall: (them) => {
    return !calls[them];
  },
  doCall(them, onstream) {
    console.log('---> CALLING', them);
    const call = me.call(them, myself.mediaStream, {metadata: {id: myself.metadata.name, call: myself.nid}});
    if (call) {
      calls[them] = call;
      call.on('error', error => console.warn(error));
      call.on('close', () => {
        console.log('call:close');
      });
    }
  },
  answerCall: media => {
    console.log('ANSWERING <---',  media.metadata);
    //
    const id = media.metadata.id;
    const meta = mediaConnections[id] = {metadata: media.metadata};
    //
    media.answer(myself.mediaStream);
    media.on('stream', stream => {
      meta.stream = stream;
      console.log('media:onstream', stream);
      myself.onstream(stream, media.metadata);
    });
    media.on('close', () => {
      console.log('media:close');
    });
  },
  endCall: them => {
    if (them) {
      console.log('.........END CALL', them);
      const call = calls[them];
      calls[them] = null;
      //call?.close?.();
      setTimeout(calls[them] = null, 500);
    }
  },
  endStreamCall: stream => {
    myself.endCall(mediaConnections[stream]?.metadata?.call);
  }
};
