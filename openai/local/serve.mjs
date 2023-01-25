import http from 'http';
import {complete} from './openai.mjs';
import {corpus} from './corpus.mjs';

const port = '1234';
const host = 'localhost';

const requestListener = async (req, res) => {
  let content;
  let code = 200;
  console.log(req.url);
  const url = new URL(req.url, 'http://scotts.open.ai');
  const prompt = url.searchParams.get('prompt');
  if (prompt) {
    console.log('sending prompt:', prompt);
    content = await requestCompletion(prompt);
    console.log('received response:', content);
  } else {
    code = 404;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(code);
  res.end(content);
};

const requestCompletion = async prompt => {
  const body = `${corpus}\n\n${prompt}`;
  //const body = `${prompt}`;
  const result = await complete(body);
  return result?.data?.choices?.[0]?.text ?? 'shrug';
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

// const receivePOST = (req, res) => {
//   return new Promise(resolve => {
//     let body = [];
//     req
//       .on('data', chunk => body.push(chunk))
//       .on('end', () => {
//         body = Buffer.concat(body).toString();
//         resolve(body);
//       })
//       ;
//   });
// }
