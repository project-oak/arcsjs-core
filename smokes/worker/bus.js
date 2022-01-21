export const Bus = {
  init() {
    onmessage = e => this.onmessage(e);
  },
  async onmessage(e) {
    try {
      //const msg = JSON.parse(e.data);
      globalThis.handleMessage(e.data, e);
    } catch(x) {
      console.error(x);
      this.postMessage('oh dear');
    }
  }
};
