import puppeteer from 'puppeteer';
import {port} from '../get_port.js';

(async () => {
  console.log(':: launching puppeteer, port:', port);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/tests/test.html`, {
    waitUntil: 'networkidle2'
  });
  console.log(':: waiting for 3s...');
  await page.waitForTimeout(3000);
  console.log(':: screenshot');
  await page.screenshot({path: './screen.png'});
  await browser.close();
  console.log(':: done');
})();
