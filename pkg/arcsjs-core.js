// export the namespace
export * from './arcs.js';

// also collect the namespace onto globalThis,
// so as to decouple resource paths
import * as Core from './arcs.js';
globalThis.Core = Core;

// outer configuration
const {config} = globalThis;
// causes it to exist, if it doesn't already
globalThis.config = {...config};

// capture absolute path to here into global config
if (config && globalThis?.document) {
  // you are here
  const localRelative = import.meta.url.split('/').slice(0, -1).join('/');
  // document root is here
  let base = document.URL;
  // if document URL has a filename, remove it
  if (base[base.length-1] !== '/') {
    base = base.split('/').slice(0, -1).join('/');
  }
  // create absoute path to here (aka 'local')
  let localAbsolute = new URL(localRelative, base).href;
  // no trailing slash!
  if (localAbsolute[localAbsolute.length-1] === '/') {
    localAbsolute = localAbsolute.slice(0, -1);
  }
  // add path
  config.paths = {
    ...config.paths,
    $core: localAbsolute
  };
}
