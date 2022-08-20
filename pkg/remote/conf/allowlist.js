// extract an absolute url to the folder 1 above here (aka 'exploder/')
import {Paths} from '../../core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 2);

export const paths = {
  $app: url,
  $config: `${url}/conf/config.js`,
  $library: `${url}/../Library`
};

// other stuff we want in the outer context
export * from '../../core/utils.min.js';
export * from '../../Library/App/Worker/App.js';
export * from '../../Library/App/surface-imports.js';
// export * from '../../Library/Dom/container-layout.js';
// export * from '../../Library/FlowGraph/NodeGraph/dom/node-graph.js';
// export * from '../../Library/FlowGraph/NodeCatalog/draggable-item.js';
//export * from '../../Library/Media/DeviceUxRecipe.js';
export * from '../../Library/Media/Dom/media-stream/media-stream.js';
