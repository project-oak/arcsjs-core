//export * from '../../Library/Core/utils.min.js';
export * from '../../Library/App/surface-imports.js';
export * from '../../Library/Dom/container-layout.js';
export * from '../../Library/NodeGraph/dom/node-graph.js';
export * from '../../Library/NodeCatalog/draggable-item.js';
export * from '../../Library/Designer/designer-layout.js';

// n.b. operates in outer context

// extract an absolute url to the folder 1 above here
import {Paths} from '../../Library/Core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 2);

// calculate important paths
export const paths = {
  $app: url,
  $config: `${url}/conf/config.js`,
  $library: `${url}/../Library`
};
