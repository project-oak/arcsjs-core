/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const StoreService = async (runtime, host, request) => {
  switch (request.msg) {
    case 'GetStoreValue':
      return getStoreValue(request.data, runtime) || null;
    case 'UpdateStoreValue':
      return updateStoreValue(request.data, runtime) || null;
    case 'ListenToChanges':
      return listenToChanges(request.data, runtime) || null;
    case 'ListenToAllChanges':
      return ListenToAllChanges(runtime, host) || null;
    case 'RemoveStore':
      return removeStore(request.data.storeId, runtime);
  }
};

const getStoreValue = ({storeId}, runtime) => {
  return runtime.stores[storeId]?.pojo;
};

const updateStoreValue = ({storeId, value}, runtime) => {
  const store = runtime.stores[storeId];
  if (store) {
    store.data = value;
  }
  return true;
};

const listenToChanges = async ({storeIds}, runtime) => {
  //console.log('created change listener', storeIds);
  return storeIds && new Promise(resolve => {
    const map = storeIds.reduce((map, id) => (map[id]=true, map), {});
    const listener = runtime.listen('store-changed', ({storeId}) => {
      if (map[storeId]) {
        //console.log('resolving change listener', storeId);
        runtime.unlisten('store-changed', listener);
        resolve({storeId, value: runtime.stores[storeId]?.pojo});
      }
    });
  });
};

const ListenToAllChanges = async (runtime, host) => {
  if (!host._storeUpdateServiceListener) {
    //console.warn('establishing store listener for', host.id);
    host._storeUpdateServiceChanges = [];
    const handler = ({storeId}) => {
      //console.warn(host.id, 'store listener invoked for', storeId);
      host._storeUpdateServiceChanges.push({storeId, value: runtime.stores[storeId]?.pojo});
      if (host._waitingForChanges) {
        //console.warn(host.id, 'FLUSHING store changes', host._storeUpdateServiceChanges);
        host._waitingForChanges(host._storeUpdateServiceChanges);
        host._storeUpdateServiceChanges = [];
        host._waitingForChanges = null;
      };
    };
    host._storeUpdateServiceListener = runtime.listen('store-changed', handler);
  }
  return new Promise(resolve => host._waitingForChanges = resolve);
};

const removeStore = (storeId, runtime) => {
  runtime.removeStore(storeId);
  Object.values(runtime.arcs).forEach(arc => arc.removeStore(storeId));
  return true;
};
