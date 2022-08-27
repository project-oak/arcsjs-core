// extract an absolute url to the folder 1 above here (aka 'exploder/')
import {Paths} from '../../Library/Core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 2);

export const paths = {
  $app: url,
  $config: `${url}/conf/config.js`,
  $library: `${url}/../Library`
};

// other stuff we want in the outer context
export * from '../../Library/Core/utils.min.js';
export * from '../../Library/App/Worker/App.js';
export * from '../../Library/App/surface-imports.js';
export * from '../../Library/Media/media-stream/media-stream.js';
export * as tryst from '../../Library/Firebase/tryst.js';
export {Myself} from '../../Library/Rtc/Myself.js';
export {Resources} from '../../Library/App/Resources.js';