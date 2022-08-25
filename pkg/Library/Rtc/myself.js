import '../../third_party/peerjs.min.js';
const {Peer} = globalThis;

let me;
let nid;

const calls = {};
const mediaConnections = {};

const start = () => {
  me = new Peer();
  me.on('error', err => console.error(err));
  // when connection to PeerServer is established, we receive our peerid
  me.on('open', id => onopen(id));
  // when a call comes in, answer it
  me.on('call', mediaConnection => myself.answerCall(mediaConnection));
};

const onopen = id => {
  nid = id;
  console.log('My peer ID is: ' + id);
  myself.onstart();
};

export const myself = {
  async start(name) {
    myself.name = name;
    // start my Peer ('me')
    start();
    // return a Promise that resolves when onstart is called
    return new Promise(resolve => myself.onstart = resolve);
  },
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
  shouldCall: them => {
    if (!myself.mediaStream) {
      // console.warn('no media stream');
      return false;
    }
    return !calls[them];
  },
  doCall(them) {
    const metadata = {
      id: myself.name,
      call: myself.nid
    };
    const call = me.call(them, myself.mediaStream, {metadata});
    // answered calls invoke me.oncall, which invokes 'answerCall'
    if (!call) {
      console.log('failed to place call');
    } else {
      //console.log(call);
      calls[them] = call;
      call.on('error', error => console.warn(error));
      call.on('close', () => console.log('call:close'));
    }
  },
  answerCall: media => {
    const metadata = media.metadata;
    const {id: name, call: nid} = metadata;
    const meta = mediaConnections[nid] = {metadata};
    //
    console.log('ANSWERING <---', name, nid);
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
      call?.close?.();
      setTimeout(calls[them] = null, 500);
    }
  },
  endStreamCall: stream => {
    myself.endCall(mediaConnections[stream]?.metadata?.call);
  }
};

// const connections = {};

// export const Connector = {
//   get me() {
//     return me;
//   },
//   get nid() {
//     return nid;
//   },
//   // look for folks who want to connect
//   async handshake(onxxx) {
//     myself.onxxx = onxxx;
//     if (myself.nid) {
//       const strangers = await tryst.meetStrangers(myself.nid);
//       strangers.forAll(pid => pid && myself.maybeConnect(pid, onxxx));
//       this.onstrangers?.(strangers);
//     }
//   },
//   maybeConnect: (them, onstream) => {
//     if (myself.shouldConnect(them)) {
//       myself.doConnect(them, onstream);
//     }
//   },
//   shouldConnect: (them) => {
//     return !connections[them];
//   },
//   doConnect(them, onxxx) {
//     console.log('---> CALLING', them);
//     const call = me.call(them, myself.mediaStream, {metadata: {id: myself.metadata.name, call: myself.nid}});
//     if (call) {
//       calls[them] = call;
//       call.on('error', error => console.warn(error));
//       call.on('close', () => {
//         console.log('call:close');
//       });
//     }
//   },
//   answerCall: media => {
//     console.log('ANSWERING <---',  media.metadata);
//     //
//     const id = media.metadata.id;
//     const meta = mediaConnections[id] = {metadata: media.metadata};
//     //
//     media.answer(myself.mediaStream);
//     media.on('stream', stream => {
//       meta.stream = stream;
//       console.log('media:onstream', stream);
//       myself.onstream(stream, media.metadata);
//     });
//     media.on('close', () => {
//       console.log('media:close');
//     });
//   },
//   endCall: them => {
//     if (them) {
//       console.log('.........END CALL', them);
//       const call = calls[them];
//       calls[them] = null;
//       //call?.close?.();
//       setTimeout(calls[them] = null, 500);
//     }
//   },
//   endStreamCall: stream => {
//     myself.endCall(mediaConnections[stream]?.metadata?.call);
//   }
// };