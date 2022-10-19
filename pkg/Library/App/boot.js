
// export const boot = async (rootMeta, arcsPath) => {
//   // handy
//   const pathJoin = (...a) => a.filter(i=>i).join('/');
//   // arcs library
//   const Library = pathJoin(arcsPath, 'Library');
//   // get Paths utility
//   const {Paths} = await import(`${Library}/Core/utils.js`);
//   Paths.pathJoin = pathJoin;
//   // configure paths
//   configurePaths(rootMeta, Library, Paths);
// };

export const configurePaths = (meta, Library, Paths) => {
  const url = meta.url.split('?').shift();
  const app = Paths.getAbsoluteHereUrl({url}, 1);
  Paths.add({
    $library: Library,
    $app: app,
    $config: `${app}/config.js`
  })
};