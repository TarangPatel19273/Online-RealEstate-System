// using puppeteer
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Log all console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000/?type=Rent', { waitUntil: 'networkidle0' });

  // Let's execute a fetch in the context of the page to match what the browser does
  const result = await page.evaluate(async () => {
    try {
      const resp = await fetch('http://localhost:8080/api/properties/search?location=&type=Rent&category=');
      if(resp.ok) {
        const data = await resp.json();
        return { success: true, count: data.length, firstId: data[0]?.id };
      } else {
        return { success: false, status: resp.status };
      }
    } catch(e) {
      return { success: false, error: e.toString() };
    }
  });

  console.log("Browser evaluate result:", result);
  
  const propertiesText = await page.evaluate(() => {
    return document.querySelector('.content-container').innerText;
  });
  
  console.log("Content text in browser:", propertiesText.substring(0, 100));

  await browser.close();
})();
