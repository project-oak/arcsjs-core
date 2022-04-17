import {Arc} from '../pkg/js/core/Arc.js';
import {Host} from '../pkg/js/core/Host.js';
import {deepCopy} from '../pkg/js/utils/object.js';

const {create, assign, entries} = Object;

const json = obj => JSON.stringify(obj);
const dom = (name, props) => assign(document.createElement(name), props);
const entry = (cursor, attr) => {
  const node = cursor.appendChild(dom('entry'));
  if (attr) {
    node.setAttribute(attr, '');
  }
  return node;
};
const logCursor = (cursor, attr) => (...args) => assign(entry(cursor, attr), {innerHTML: args.join('')});

// create a logger
const {logbook} = window;
export const log = logCursor(logbook, 'console');
export const sysLog = logCursor(logbook, 'system');
export const errLog = logCursor(logbook, 'error');

// create a dummy Particle
export const dumyicle = {
  meta: {
    bindings: {
      value: 'itisstore'
    }
  },
  internal: {
    inputs: {}
  },
  get inputs() {
    return this.internal.inputs;
  },
  set inputs(inputs) {
    // shallow-clone our input dictionary
    const inpots = assign(create(null), inputs);
    // mutate each input into a shallow-clone
    entries(inpots).forEach(([key, value]) => {
      if (value && (typeof value === 'object')) {
        inpots[key] = Array.isArray(value) ? [...value] : {...value};
      }
    });
    // these is them inpouts
    this.internal.inputs = inpots;
  }
};

export const prepStuff = async store => {
  // create an Arc
  const arc = new Arc('arc');
  // the Arc can call the store whatever it wants
  arc.addStore('itisstore', store);
  // construct a Host, attach a dummy Particle
  const host = new Host();
  host.meta = dumyicle.meta;
  host.particle = dumyicle;
  // add `host` to `arc`
  await arc.addHost(host);
  // track when the host signals a change
  const changes = [];
  host.listen(
    'inputs-changed',
    () => {
      //sysLog('Host:inputs-changed:', JSON.stringify(host.particle.inputs, null, '  '));
      changes.push(deepCopy(host.particle.inputs));
    },
    'ahoy'
  );
  changes.disposeListener = () => host.unlisten('inputs-changed', 'ahoy');
  changes.finalize = () => (changes.disposeListener(), changes);
  return changes;
};

export const expectJson = async (changes, expectedChanges) => {
  const expectedJson = json(expectedChanges);
  const value = await new Promise((resolve) => {
    let tries = 10;
    const one_try = () => {
      const changeJson = json(changes);
      if (expectedJson === changeJson) {
        resolve({pass: true, expected: expectedJson, value: changeJson});
      }
      if (tries-- > 0) {
        setTimeout(one_try, 100);
      } else {
        resolve({pass: false, expected: expectedJson, value: changeJson});
      }
    };
    one_try();
  });
  changes.finalize();
  return value;
};
