/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { debounce, asyncTask } from '../utils/task.js';
import { logFactory } from '../utils/log.js';
import { Automerge } from '../../third_party/automerge/automerge.js';
const peerUpdateDebounceGapMs = 100;
const simulatedNetworkLatencyMs = 100;
const { values } = Object;
const stringToMessage = (syncString) => {
    return new Uint8Array(JSON.parse(`[${atob(syncString)}]`));
};
// const stringToMessage = (syncString: string) => {
//   const raw = atob(syncString);
//   const {length} = raw;
//   const uint8s = new Uint8Array(new ArrayBuffer(length));
//   for (let i=0; i<length; i++) {
//     uint8s[i] = raw.charCodeAt(i);
//   }
//   return uint8s;
// };
const messageToString = (syncMessage) => {
    return btoa(syncMessage);
};
// only for loopback
const networks = {};
export class AutomergeNetwork {
    log;
    log2;
    nid;
    runtime;
    shares;
    constructor(nid, runtime) {
        this.shares = {};
        this.nid = nid;
        this.runtime = runtime;
        this.log = logFactory(logFactory.flags.network, `network[${nid}]`, '#512DA8');
        this.log2 = logFactory(logFactory.flags.network, `network[${nid}]`, '#4527A0');
        this.connectEndpoint();
    }
    connectEndpoint() {
        const { endpoint } = this.runtime;
        if (endpoint) {
            endpoint.onreceive = (peer, message) => this.receive(peer, message);
        }
        else {
            // only for loopback
            networks[this.nid] = this;
        }
    }
    shareStore(storeId, peerId) {
        // this.shares maps storeIds to peerShares
        const peerShares = this.shares[storeId] ?? (this.shares[storeId] = {});
        // peerShares maps a peerId to a share
        const share = peerShares[peerId] ?? (peerShares[peerId] = this.initShare(storeId, peerId));
        // update this share
        this.updatePeer(share);
    }
    invalidatePeers(storeId) {
        const key = `${this.nid}_${storeId}_updatePeersDebounceKey`;
        this[key] = debounce(this[key], () => this.updatePeers(storeId), peerUpdateDebounceGapMs);
    }
    initShare(storeId, peerId) {
        this.runtime.endpoint?.ring(peerId);
        return {
            storeId,
            peerId,
            syncState: Automerge.initSyncState()
        };
    }
    updatePeer(share) {
        const store = this.runtime.stores[share.storeId];
        if (store) {
            const [nextSyncState, syncMessage] = Automerge.generateSyncMessage(store.crdt, share.syncState);
            share.syncState = nextSyncState;
            if (syncMessage) {
                this.send(share, syncMessage);
            }
        }
    }
    send(share, syncMessage) {
        // TODO(sjmiles): endpoint a la Firebase is too stoopid to handle syncMessage properly :(
        // becuase syncMessage is not utf-8 compatible
        const syncString = messageToString(syncMessage);
        const packet = { storeId: share.storeId, syncString };
        this.log(`send sync for [${share.storeId}] to [${share.peerId}]`);
        if (this.runtime.endpoint?.send) {
            this.runtime.endpoint.send(share.peerId, packet);
        }
        else {
            // loopback only
            const network = networks[share.peerId];
            if (network) {
                asyncTask(() => network.receive(this.nid, packet), simulatedNetworkLatencyMs);
            }
        }
    }
    receive(peerId, { storeId, syncString }) {
        // endpoint a la Firebase is too stoopid to handle syncMessage properly :(
        const syncMessage = stringToMessage(syncString);
        this.log2(`receive sync for [${storeId}] from [${peerId}]`); //, syncMessage);
        const store = this.runtime.stores[storeId];
        const share = this.shares[storeId]?.[peerId];
        if (store && share) {
            const [nextCrdt, nextSyncState] = Automerge.receiveSyncMessage(store.crdt, share.syncState, syncMessage);
            share.syncState = nextSyncState;
            this.updateCrdt(share.storeId, store, nextCrdt);
        }
        else {
            this.log.warn(`receive: store [${storeId}] doesn't exist`);
        }
    }
    updateCrdt(storeId, store, crdt) {
        // ensure everybody has the same crdt
        if (store.crdt !== crdt) {
            store.setCrdt(crdt);
        }
        else {
            // we need to invalidate regardless
            this.invalidatePeers(storeId);
        }
    }
    updatePeers(storeId) {
        this.log(`updatePeers`, storeId);
        const shares = this.shares[storeId];
        if (shares) {
            values(shares).forEach(share => this.updatePeer(share));
        }
    }
}
