import {LobbyApp} from './LobbyApp.js';

const app = new LobbyApp({
  $engine: './arcs.js',
  $library: '../Library',
  $app: '.'
});
await app.spinup();

// we are live now
console.log('Hello from startup!');
