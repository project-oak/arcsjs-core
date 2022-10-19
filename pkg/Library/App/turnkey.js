export const turnkey = async (App, Paths) => {
  try {
    app = globalThis.app = new App(Paths.map);
    await app.spinup();
  } catch(x) {
    console.error(x);
  }
};
