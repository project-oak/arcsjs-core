// load test-admin custom element
import * as specs from './specs/specs.js';
import './lib/test-admin.js';

// define our tests
const suite = [
  './specs/NoderTests.js',
  './specs/BaserTests.js',
  './specs/BaserAutoTests.js'
];

// initialize
const {assign, create} = Object;
const allTests = create(null);

// load our test suite
await Promise.all(suite.map(async test => {
  try {
    const module = await import(test);
    assign(allTests, module);
  } catch(x) {
    console.warn('test failed to load');
    console.error(x);
  }
}));

// get a test-admin from index.html
const {admin} = window;
// give it the suite of tests
admin.alltests = specs;
