export * from '../../core/utils.min.js';
export * from '../../Library/App/surface-imports.js';
export * from '../../Library/Dom/container-layout.js';
export * from '../../Library/NodeGraph/dom/node-graph.js';
export * from '../../Library/NodeCatalog/draggable-item.js';

// n.b. operates in outer context

// extract an absolute url to the folder 1 above here (aka 'exploder/')
import {Paths} from '../../core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 2);

// calculate important paths
export const paths = {
  $app: url,
  $config: `${url}/conf/config.js`,
  $library: `${url}/../Library`
};