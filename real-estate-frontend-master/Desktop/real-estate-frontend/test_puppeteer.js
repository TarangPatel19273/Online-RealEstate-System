const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Capture failed requests
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
  });

  page.on('response', response => {
    if (!response.ok() && response.request().method() !== 'OPTIONS') {
        console.log(`RESPONSE ERROR: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // Navigate to admin visits directly
    console.log("Navigating to /admin/visits");
    await page.goto('http://localhost:3000/admin/visits', { waitUntil: 'networkidle2' });

    // It might redirect or just show the Visit Management table
    // Let's set the token in localStorage to bypass login if needed
    await page.evaluate(() => {
        localStorage.setItem('token', 'dummy'); 
        // Token doesn't really matter for backend since it permits all, but maybe frontend requires it?
    });
    // Reload to apply token
    await page.reload({ waitUntil: 'networkidle2' });

    console.log("Waiting for row with ID 1...");
    await page.waitForSelector('table.admin-table tbody tr');

    // Click Approve
    console.log("Clicking Approve...");
    
    // We need to handle the window.prompt
    page.on('dialog', async dialog => {
        console.log("Dialog appeared:", dialog.message());
        await dialog.accept(""); // Enter empty string and click OK
    });

    await page.evaluate(() => {
        const approveBtns = Array.from(document.querySelectorAll('button.btn-success'));
        const approveBtn = approveBtns.find(btn => btn.innerText.includes('Approve'));
        if (approveBtn) {
            approveBtn.click();
        } else {
            console.log("Approve button not found");
        }
    });

    // Wait a bit to let the request happen
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("Done.");
  } catch (err) {
    console.error("Puppeteer Script Error:", err);
  } finally {
    await browser.close();
  }
})();
