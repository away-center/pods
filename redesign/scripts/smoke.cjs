/* Local visual QA. Start python3 -m http.server 8080 in the repo first. */
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://127.0.0.1:8080/redesign/preview/',{waitUntil:'networkidle'});
  await page.screenshot({path:'/tmp/away-pods-desktop.png'});
  await page.locator('.roles-section').screenshot({path:'/tmp/away-pods-roles.png'});
  await page.getByRole('tab',{name:'Sales support'}).click();
  console.log('role-click='+await page.locator('[data-role-title]').textContent());
  console.log('font='+await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily));
  console.log('desktop-overflow='+await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
  await page.goto('http://127.0.0.1:8080/redesign/preview/start/',{waitUntil:'networkidle'});
  await page.screenshot({path:'/tmp/away-pods-start.png'});
  const mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  await mobile.goto('http://127.0.0.1:8080/redesign/preview/',{waitUntil:'networkidle'});
  await mobile.screenshot({path:'/tmp/away-pods-mobile.png'});
  console.log('mobile-overflow='+await mobile.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
  await mobile.getByRole('button',{name:'Menu'}).click();
  console.log('menu-expanded='+await mobile.getByRole('button',{name:'Close'}).getAttribute('aria-expanded'));
  console.log('console-errors='+JSON.stringify(errors));
  await browser.close();
})().catch(err=>{console.error(err);process.exitCode=1});
