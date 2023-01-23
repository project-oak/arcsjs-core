import "../../third_party/fission/index.umd.min.js";
import {auth} from './auth.js';

auth(async ({wn, state: {fs}}) => {
  const path = fs.appPath();
  console.log(path);
  const links = await fs.ls(path);
  console.log(links);
  const content = '"Kirby was here."';
  const path1 = fs.appPath(wn.path.file('test.json'));
  await fs.write(path1, content);
  const path2 =  wn.path.file("public", "FissionSmoke", "Public", "test.json");
  await fs.add(path2, content);
  await fs.publish();
});
