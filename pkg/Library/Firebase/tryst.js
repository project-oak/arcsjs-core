/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const tryst = `https://arcsjs-apps.firebaseio.com/tryst`;

export const meetStrangers = async (aeon, nid, meta) => {
  // first get all beacons
  let beacons = await fetchBeacons(aeon);
  // one-pass gambit: beacons are erased periodically, so stale beacons do not reappear
  // TODO(sjmiles): still need a way to clear stale messages
  if (Math.random() < 0.1) {
    await clearBeacons();
  }
  // ensure our beacon exists at larege
  await placeBeacon(nid, meta);
  // clean input
  if (beacons) {
    // don't need ours
    delete beacons[nid];
  } else {
    beacons = {};
  }
  return beacons;
};

const fetchBeacons = async () => {
  const res = await fetch(`${tryst}/aeon/beacons.json`);
  return res.json();
};

const clearBeacons = async () => {
  return put(`${tryst}/beacons.json`, {});
};

const placeBeacon = async (nid, meta) => {
  await put(`${tryst}/beacons/${nid}.json`, meta);
};

const put = async (url, body) => {
  const method = 'PUT';
  const headers = {'Content-Type': 'application/json'};
  return fetch(url, {method, headers, body: JSON.stringify(body)});
};
