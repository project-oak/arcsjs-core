import puppeteer from 'puppeteer';
import {port} from './get_port.js';

(async () => {
  console.log(':: launching puppeteer, using server port:', port);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/pkg/tests/puppet.html`, {
    waitUntil: 'networkidle2'
  });
  const passed = await page.evaluate(() => {
    const {runTests, specs} = globalThis.strings;
    return runTests(specs);
  });
  // console.log(':: waiting for 3s...');
  // await page.waitForTimeout(3000);
  // console.log(':: screenshot');
  // await page.screenshot({path: './screen.png'});
  //
  await browser.close();
  console.log(':: done');
  //
  console.log('results:', passed);
  globalThis.process.exitCode = passed ? 0 : 1;
})();
