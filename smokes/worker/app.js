//import {Runtime} from '../../arcs.js';
import {Paths} from '../../js/utils/paths.js';
import {Runtime} from '../../js/Runtime.js';
import {Host} from '../../js/core/Host.js';
import {Arc} from '../../js/core/Arc.js';
import '../../js/isolation/ses.js';

Paths.add({
  // where platform modules are
  $engine: '../../js',
  // where Particles are
  $library: '../'
});

const particleSpec = {
  // $library path above is where to look for `HelloWorld` Particle
  kind: 'HelloWorld',
  inputs: {
    things: {}
  }
};

(async () => {
  const user = new Runtime('user');
  //
  const arc = new Arc('arc');
  await user.addArc(arc);
  //
  const host = new Host('helloWorld');
  await user.marshalParticle(host, particleSpec);
  await arc.addHost(host);
  //
  console.log(user);
  console.log(arc);
  console.log(host);
})();