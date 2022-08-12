import {ArcsWorker as Arcs} from './arcs/ArcsWorker.js';
import {MyRecipe} from './MyRecipe.js';

console.log('Hello!');

// vibrational paths are worker-relative
Arcs.receiveVibrations(msg => console.log(msg));
Arcs.sendVibration({kind: 'addRecipe', recipe: MyRecipe, arc: 'myArc'});
