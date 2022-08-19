import {LobbyApp} from './LobbyApp.js';

const app = new LobbyApp({
  $config: './arcs.js',
  $library: '../Library',
  $app: '.'
});
await app.spinup();

// we are live now
console.log('Hello from startup!');
