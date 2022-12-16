// extract an absolute url to the folder 2 above here (counting the filename, aka '/')
import {Paths} from '../../Library/Core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 3);

globalThis.config = {
  arcsPath: url,
  aeon: 'nodegraph/0.4.4',
  meta: 'nodegraph',
  //theme: 'dark',
  logFlags: {
    app: true,
    //recipe: true,
    //arc: true,
    particles: true,
    //storage: true,
    //surfaces: true,
    //services: true
  }
};
