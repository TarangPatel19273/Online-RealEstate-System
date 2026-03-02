const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/?type=Rent', { waitUntil: 'networkidle0' });
  
  // Wait a moment for any react states to settle
  await new Promise(r => setTimeout(r, 1000));
  
  const content = await page.evaluate(() => {
     const container = document.querySelector('.content-container');
     return container ? container.innerHTML : "NO CONTAINER";
  });
  
  console.log("HTML:", content);
  
  await browser.close();
})();
