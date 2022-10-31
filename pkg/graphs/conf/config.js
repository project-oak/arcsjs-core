// extract an absolute url to the folder 2 above here (counting the filename, aka '/')
import {Paths} from '../../Library/Core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 3);

globalThis.config = {
  arcsPath: url,
  aeon: 'graphs/0.0.1',
  meta: 'graphs',
  // theme: 'dark',
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
