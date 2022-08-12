const tryst = `https://arcsjs-apps.firebaseio.com/tryst_pjs`;

const {keys, entries, values} = Object;
const {stringify: json} = JSON;
const pretty = value => json(value, null, '  ');

export const meetStrangers = async (nid) => {
  let beacons = await fetchBeacons();
  // one-pass gambit: beacons are erased periodically to flush stale beacons
  // TODO(sjmiles): still need a way to clear stale messages
  if (Math.random() < 0.25) {
    await clearBeacons();
  }
  await placeBeacon(nid);
  //
  if (beacons) {
    delete beacons[nid];
  } else {
    beacons = {};
  }
  //
  const ids = keys(beacons);
  // if (ids.length) {
  //   console.log(`tryst[${nid}]:beacons`, pretty(ids));
  // }
  return ids;
};

const fetchBeacons = async () => {
  const res = await fetch(`${tryst}/beacons.json`);
  return res.json();
};

const clearBeacons = async () => {
  return put(`${tryst}/beacons.json`, {});
};

const placeBeacon = async (nid) => {
  await put(`${tryst}/beacons/${nid}.json`, true);
};

const put = async (url, body) => {
  const method = 'PUT';
  const headers = {'Content-Type': 'application/json'};
  return fetch(url, {method, headers, body: JSON.stringify(body)});
};

export const broadcast = async (peers, nid, msg) => {
  const send = async id => sendMessage(id, nid, msg);
  return Promise.all(keys(peers).map(send));
};

export const sendMessage = async (id, nid, msg) => {
  if (id != nid) {
    log(`sending to peer:${id}`, JSON.stringify(msg).slice(0, 15), '...');
    return put(`${tryst}/notes/${id}/${nid}.json`, msg);
  }
};

export const flushMessages = async (nid, peer, answered) => {
  const res = await fetch(`${tryst}/notes/${nid}.json`);
  const messages = await res.json();
  put(`${tryst}/notes/${nid}.json`, {});
  return messages;
  // if (messages) {
  //   processMessages(peer, answered, messages);
  //   put(`${tryst}/notes/${nid}.json`, {});
  // }
};

// export const processMessages = (peer, answered, messages) => {
//   entries(messages).forEach(([strangerId, msg]) => {
//     if (msg?.type === 'offer' && !answered[strangerId]) {
//       log(`offer from [peer:${strangerId}]`);
//       peer.answer(msg);
//       answered[strangerId] = true;
//     }
//   });
// };
