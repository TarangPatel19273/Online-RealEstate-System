const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  page.on('response', response => {
    if (!response.ok() && response.request().method() !== 'OPTIONS') {
        console.log(`RESPONSE ERROR: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log("Navigating to /login");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    console.log("Logging in as admin...");
    // Fill credentials. The user has email omp811@test.com? Or maybe 23ceuxs115@ddu.ac.in
    // Look at my previous curls: "omp811" "23ceuxs115@ddu.ac.in", password was $2a...
    // Let's just create an admin user or see if we can bypass it by hitting the API to make an admin user first.
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
