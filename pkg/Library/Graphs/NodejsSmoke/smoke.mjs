import './config.js';
import {Paths} from '../../Core/core.js';
import {graph} from './graph.js';

// import path from 'path';
// import {fileURLToPath} from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

Paths.add({
  // $library: `${__dirname}/../../Library`,
  // $library: 'file:///Users/sjmiles/Sites/projects/goub/arcsjs-deploy/0.4.4/arcsjs-core/pkg/Library',
  // $library: 'file://../../Library',
  $library: 'http://localhost:9888/0.4.4/Library'
});

export const Graph = {
  nodes: {
    Data: {
      type: 'DataNode',
      props: {
        data: [
          {first: "Don", last: "Quixote"},
          {first: "Sancho", last: "Panza"}
        ]
      }
    },
    JSONata: {
      type: 'JSONataNode',
      connections: {
        json: ['Data:data']
      },
      props: {
        expression: 'first'
      }
    }
  }
};

const user = await graph(Graph);

// console.log(Object.keys(user.stores));
// const dataStore = user.stores['Data:data'];
// dataStore?.listen('change', () => console.log(dataStore?.pretty));

//console.log(user.stores);
//console.log(user.arcs);

let done;

const resultStore = user.stores['JSONata:result'];
resultStore?.listen('change', () => {
  console.log(resultStore?.data);
  done = true;
});

while (!done);
