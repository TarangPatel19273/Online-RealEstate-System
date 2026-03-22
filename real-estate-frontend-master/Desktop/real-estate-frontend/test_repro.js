const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('response', response => {
    if (!response.ok() && response.request().method() !== 'OPTIONS') {
        console.log(`ERR: ${response.status()} ${response.url()}`);
    }
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Set token arbitrarily to bypass token checks
    await page.evaluate(() => {
        localStorage.setItem('token', 'dummy'); 
        localStorage.setItem('user', JSON.stringify({id: 1, role: 'ADMIN'}));
    });

    await page.goto('http://localhost:3000/admin/visits', { waitUntil: 'networkidle2' });
    
    // Wait for the rows
    await page.waitForSelector('.action-btn.btn-success', { timeout: 10000 });
    
    console.log("Button found. Clicking it...");
    page.on('dialog', async dialog => {
        console.log("Dialog msg:", dialog.message());
        await dialog.accept("looks good");
    });
    
    await page.click('.action-btn.btn-success');
    
    // waiting a bit to see what happens
    await new Promise(r => setTimeout(r, 2000));
    console.log("Done checking");
  } catch(e) {
    console.error("Puppeteer fail", e);
  } finally {
    await browser.close();
  }
})();
